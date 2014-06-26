from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter

from cirb.relex.content.vocabularies import getTerm, getTerms
from cirb.relex.i18n import _


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

    def getStatus(self, project):
        STATUS = {
            'active': _('Active'),
            'inactive': _('Inactive'),
            'archive': _('Archive'),
        }
        return STATUS.get(project.getStatus(), '')

    def getRelationType(self, project):
        RTYPE = {
            'bilateral': _('Bilateral'),
            'multilateral': _('Multilateral'),
        }
        return RTYPE.get(project.getRelationtype(), '')

    def getOrganisationType(self, project):
        organisation = getTerm(
            'organisationtype', project.getOrganisationtype()
        )
        if organisation is None:
            return None
        return organisation['name'].get(self.current_language, None)
