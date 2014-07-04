from time import time

from plone.memoize import ram
from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter
from zope.security import checkPermission

from cirb.relex.content.vocabularies import getTerm, getTerms, getVocabulary
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

    def canManageRelex(self):
        return checkPermission('cirb.relex.ManageRelex', self.context)


def getProjectKey(fun, view, project):
    """ Key for ram.cache().  60 * 30 = 30 minutes """
    return '{0}{1}'.format(project.UID, time() // (60 * 30))


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

    def canManageRelex(self):
        return checkPermission('cirb.relex.ManageRelex', self.context)

    def getProjects(self):
        return self.catalog(portal_type="Project")

    def getAllStatus(self):
        wtool = getToolByName(self.context, 'portal_workflow')
        workflow = wtool.getWorkflowById('cirb_relex_project_workflow')
        states = {
            state_id: state.title
            for state_id, state in workflow.states.items()
        }
        return states

    def getAllTermsName(self, vocabulary_id):
        terms = [t['name'].get(self.current_language, None)
                 for t in getVocabulary(vocabulary_id)]
        terms = sorted(list(set(terms)))
        return terms

    def getAllTermsContact(self, vocabulary_id):
        terms = [u'{0} {1}'.format(t['lastname'], t['firstname'])
                 for t in getVocabulary(vocabulary_id)]
        terms = sorted(list(set(terms)))
        return terms

    @ram.cache(getProjectKey)
    def getCode(self, project):
        project = project.getObject()
        return project.getCode()

    @ram.cache(getProjectKey)
    def getName(self, project):
        project = project.getObject()
        if self.current_language == 'fr':
            return project.getName_fr()
        if self.current_language == 'en':
            return project.getName_en()
        if self.current_language == 'nl':
            return project.getName_nl()

    @ram.cache(getProjectKey)
    def getStatus(self, project):
        project = project.getObject()
        return project.getStatus()

    @ram.cache(getProjectKey)
    def getRelationType(self, project):
        project = project.getObject()
        relation = getTerm(
            'relationtype', project.getRelationtype()
        )
        if relation is None:
            return None
        return relation['name'].get(self.current_language, None)

    @ram.cache(getProjectKey)
    def getOrganisationType(self, project):
        project = project.getObject()
        organisation = getTerm(
            'organisationtype', project.getOrganisationtype()
        )
        if organisation is None:
            return None
        return organisation['name'].get(self.current_language, None)

    @ram.cache(getProjectKey)
    def getThemes(self, project):
        project = project.getObject()
        ids = project.getThemes()
        terms = getTerms('theme', ids)
        return [
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getKeywords(self, project):
        project = project.getObject()
        ids = project.getKeywords()
        terms = getTerms('keywords', ids)
        return [
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getCountries(self, project):
        project = project.getObject()
        ids = project.getCountries()
        terms = getTerms('country', ids)
        return [
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getRegions(self, project):
        project = project.getObject()
        ids = project.getRegions()
        terms = getTerms('region', ids)
        return [
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getCities(self, project):
        project = project.getObject()
        ids = project.getCities()
        terms = getTerms('city', ids)
        return [
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getContacts(self, project):
        project = project.getObject()
        ids = project.getContacts()
        terms = getTerms('contact', ids)
        return [
            u'{0} {1}'.format(term['lastname'], term['firstname'])
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getPartners(self, project):
        project = project.getObject()
        ids = project.getBrusselspartners()
        terms = getTerms('brusselspartners', ids)
        return sorted([
            u'{0} {1}'.format(term['lastname'], term['firstname'])
            for term in terms if term is not None
        ])
