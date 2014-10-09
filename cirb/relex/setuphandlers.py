from Products.CMFCore.utils import getToolByName
from zope.interface import alsoProvides
from cirb.relex.interfaces import IRelexBackend
from cirb.relex.import_csv import import_csv
import os


def setupVarious(context):
    if not context.isDirectory('Relex'):
        return

    # Create relex_web folder
    site = context.getSite()
    if 'relex_web' not in site.objectIds():
        site.invokeFactory(
            'Folder', 
            'relex_web', 
            title='Relex',
            language=None,
            excludeFromNav=True)

        relex_web = site.relex_web

        portal_workflow = getToolByName(site, 'portal_workflow')
        portal_workflow.doActionFor(relex_web, 'publish')

        alsoProvides(relex_web, IRelexBackend)

        relex_web.setLayout('@@relex_tree_view')

        # Import data
        dataFolder = os.path.join( context._profile_path, 'Relex' )
        import_csv(relex_web, dataFolder)
