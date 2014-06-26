from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView


class TreeView(BrowserView):
    def __call__(self):
        self.catalog = getToolByName(self.context, 'portal_catalog')
        return self.index()

    def getProjectsTree(self, path='/Plone/relex_web'):
        projects = []
        for brain in self.catalog(
                path={'query': path, "depth": 1},
                sort_on='sortable_title',
        ):
            projects.append({
                'obj': brain,
                'child': self.getProjectsTree(path=brain.getPath()),
            })
        return projects


class SearchView(BrowserView):
    def __call__(self):
        self.catalog = getToolByName(self.context, 'portal_catalog')
        return self.index()

    def getProjects(self):
        return self.catalog(portal_type="Project")
