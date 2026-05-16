<!-- IMPORT partials/breadcrumbs.tpl -->
<div data-widget-area="header">
	{{{ each widgets.header }}}
	{{widgets.header.html}}
	{{{ end }}}
</div>
<div class="row justify-content-center">
	<div class="col-12">
		{{{ if pagination.pages.length }}}
		<div><!-- IMPORT partials/category/selector-dropdown-left.tpl --></div>
		{{{ else }}}
		<h1 class="categories-title text-uppercase text-sm mb-2 fw-normal">[[pages:categories]]</h1>
		{{{ end }}}
		<ul class="categories list-unstyled" itemscope itemtype="http://www.schema.org/ItemList">
			{{{ each categories }}}
			<!-- IMPORT partials/categories/item.tpl -->
			{{{ end }}}
		</ul>
		<!-- IMPORT partials/paginator.tpl -->
	</div>
</div>
<div data-widget-area="footer">
	{{{ each widgets.footer }}}
	{{widgets.footer.html}}
	{{{ end }}}
</div>
