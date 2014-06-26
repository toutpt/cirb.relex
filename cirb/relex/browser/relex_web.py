from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter


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
        self.update()
        return self.index()

    def update(self):
        self.catalog = getToolByName(self.context, 'portal_catalog')
        context = self.context.aq_inner
        portal_state = getMultiAdapter((context, self.request),
                                       name=u'plone_portal_state')
        self.current_language = portal_state.language()

    def getProjects(self):
        return self.catalog(portal_type="Project")

    def getName(self, project):
        if self.current_language == 'fr':
            return project.getName_fr()
        if self.current_language == 'en':
            return project.getName_en()
        if self.current_language == 'nl':
            return project.getName_nl()
