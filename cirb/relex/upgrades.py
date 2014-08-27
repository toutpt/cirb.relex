from Products.CMFCore.utils import getToolByName
PROFILE = 'profile-cirb.relex:default'


def fixOrganisationAndThemeRelation(context):
	"""fix(data): organisation & theme relations array issues
	['1', '2', ['3'], ['4']] ->['1', '2', '3', '4']"""
	relex = context.relex_web
	view = relex.restrictedTraverse('@@relex_vocabulary')
	organisations = view._getTerms('organisation')
	themes = view._getTerms('theme')
	for theme in themes:
		keywords = theme['keywords']
		new_keywords = []
		for keyword in keywords:
			if isinstance(keyword, list):
				new_keywords.append(keyword[0])
			else:
				new_keywords.append(keyword)
		theme['keywords'] = new_keywords
	view.dump('theme', themes)
	for organisation in organisations:
		cells = organisation['cell']
		new_cells = []
		for cell in cells:
			if isinstance(cell, list):
				new_cells.append(cell[0])
			else:
				new_cells.append(cell)
		organisation['cell'] = new_cells
	view.dump('organisation', organisations)

def common(context):
    setup = getToolByName(context, 'portal_setup')
    setup.runAllImportStepsFromProfile(PROFILE)
