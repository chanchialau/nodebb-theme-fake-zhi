'use strict';

const meta = require.main.require('./src/meta');
const winston = require.main.require('winston');

const controllers = require('./lib/controllers');

const library = module.exports;

const TURNSTILE_SITE_KEY = process.env.CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAADQcg4x3BTajrcrz';
const TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

library.init = async function (params) {
	const { router, middleware } = params;
	const routeHelpers = require.main.require('./src/routes/helpers');

	router.post('/login', verifyTurnstileLogin);

	routeHelpers.setupAdminPageRoute(router, '/admin/plugins/persona', [], controllers.renderAdminPage);

	routeHelpers.setupPageRoute(router, '/user/:userslug/theme', [
		middleware.exposeUid,
		middleware.ensureLoggedIn,
		middleware.canViewUsers,
		middleware.checkAccountPermissions,
	], controllers.renderThemeSettings);
};

library.addAdminNavigation = async function (header) {
	header.plugins.push({
		route: '/plugins/persona',
		icon: 'fa-paint-brush',
		name: 'Persona Theme',
	});
	return header;
};

library.addProfileItem = async (data) => {
	data.links.push({
		id: 'theme',
		route: 'theme',
		icon: 'fa-paint-brush',
		name: '[[themes/persona:settings.title]]',
		visibility: {
			self: true,
			other: false,
			moderator: false,
			globalMod: false,
			admin: false,
		},
	});

	return data;
};

library.defineWidgetAreas = async function (areas) {
	const locations = ['header', 'sidebar', 'footer'];
	const templates = [
		'categories.tpl', 'category.tpl', 'topic.tpl', 'users.tpl',
		'unread.tpl', 'recent.tpl', 'popular.tpl', 'top.tpl', 'tags.tpl', 'tag.tpl',
		'login.tpl', 'register.tpl', 'world.tpl',
	];
	function capitalizeFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	templates.forEach((template) => {
		locations.forEach((location) => {
			areas.push({
				name: `${capitalizeFirst(template.split('.')[0])} ${capitalizeFirst(location)}`,
				template: template,
				location: location,
			});
		});
	});

	areas = areas.concat([
		{
			name: 'Main post header',
			template: 'topic.tpl',
			location: 'mainpost-header',
		},
		{
			name: 'Main post footer',
			template: 'topic.tpl',
			location: 'mainpost-footer',
		},
		{
			name: 'Account Header',
			template: 'account/profile.tpl',
			location: 'header',
		},
	]);
	return areas;
};

library.getThemeConfig = async function (config) {
	const settings = await meta.settings.get('persona');
	config.hideSubCategories = settings.hideSubCategories === 'on';
	config.hideCategoryLastPost = settings.hideCategoryLastPost === 'on';
	config.enableQuickReply = settings.enableQuickReply === 'on';
	config.turnstileLogin = {
		enabled: !!TURNSTILE_SECRET_KEY,
		siteKey: TURNSTILE_SITE_KEY,
	};
	return config;
};

async function verifyTurnstileLogin(req, res, next) {
	if (!TURNSTILE_SECRET_KEY) {
		return next();
	}

	const token = req.body && req.body['cf-turnstile-response'];
	if (!token) {
		return res.status(400).send('Human verification failed. Please refresh the page and try again.');
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(TURNSTILE_VERIFY_URL, {
			method: 'POST',
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				secret: TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: req.ip,
			}),
			signal: controller.signal,
		});

		clearTimeout(timeout);

		const result = await response.json();
		if (result && result.success) {
			return next();
		}

		winston.warn(`[persona/turnstile] Login verification failed: ${(result && result['error-codes'] || []).join(', ')}`);
		return res.status(400).send('Human verification failed. Please try again.');
	} catch (err) {
		winston.error(`[persona/turnstile] Login verification error: ${err.stack || err.message}`);
		return res.status(400).send('Human verification is temporarily unavailable. Please try again.');
	}
}
