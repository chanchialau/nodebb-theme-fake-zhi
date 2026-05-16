<div class="lastpost border-start border-4 lh-sm h-100" style="border-color: {./bgColor}!important;">
	{{{ each ./posts }}}
	<div component="category/posts" class="category-preview-post ps-2 text-xs d-flex flex-column gap-1">
		<div class="text-nowrap text-truncate">
			<a class="text-decoration-none avatar-tooltip" title="{./user.displayname}" href="{config.relative_path}/user/{./user.userslug}">{buildAvatar(posts.user, "18px", true)}</a>
			<a class="permalink text-muted timeago text-xs" href="{config.relative_path}/topic/{./topic.slug}{{{ if ./index }}}/{./index}{{{ end }}}" title="{./timestampISO}" aria-label="[[global:lastpost]]"></a>
		</div>
		<div class="post-content text-xs text-break line-clamp-sm-2 lh-sm position-relative">
			<a class="stretched-link" tabindex="-1" href="{config.relative_path}/topic/{./topic.slug}{{{ if ./index }}}/{./index}{{{ end }}}" aria-label="[[global:lastpost]]"></a>
			{./content}
		</div>
	</div>
	{{{ end }}}

	{{{ if !./posts.length }}}
	<div component="category/posts" class="ps-2">
		<div class="post-content overflow-hidden text-xs">
			[[category:no-new-posts]]
		</div>
	</div>
	{{{ end }}}
</div>
