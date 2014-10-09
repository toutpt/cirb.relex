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
                portal_type="Project",
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
    return '{0}{1}'.format(project.UID, project.modified.ISO())


class SearchView(BrowserView):
    def __call__(self):
        self.update()
        return self.index()

    def update(self):
        self._cache_orgnisation = None
        self._project = None
        self.catalog = getToolByName(self.context, 'portal_catalog')
        context = self.context.aq_inner
        portal_state = getMultiAdapter((context, self.request),
                                       name=u'plone_portal_state')
        self.current_language = portal_state.language()

    def getContactOrganisation(self, contact):
        if self._cache_orgnisation is None:
            vocab = getVocabulary('organisation')
            self._cache_orgnisation = {}
            for term in vocab:
                self._cache_orgnisation[term['id']] = term
        if contact['organisation']:
            orga = self._cache_orgnisation[contact['organisation']]
            return orga['id']

    def canManageRelex(self):
        return checkPermission('cirb.relex.ManageRelex', self.context)

    def getProjects(self):
        projects = self.catalog(portal_type="Project")
        projects = [
            project for project in projects
            if project.review_state != 'inactive'
        ]
        return projects

    def getAllStatus(self):
        wtool = getToolByName(self.context, 'portal_workflow')
        workflow = wtool.getWorkflowById('cirb_relex_project_workflow')
        states = {
            state_id: state.title
            for state_id, state in workflow.states.items()
            if state_id != 'inactive'
        }
        return states

    def getAllTermsName(self, vocabulary_id):
        terms = [t['name'].get(self.current_language, None)
                 for t in getVocabulary(vocabulary_id)]
        terms = sorted(list(set(terms)))
        return terms

    def getAllTermsIdName(self, vocabulary_id):
        terms = [(t['id'], t['name'].get(self.current_language, None))
                 for t in getVocabulary(vocabulary_id)]
        terms = sorted(list(set(terms)), key=lambda term: term[1])
        return terms

    def getAllTermsContact(self, vocabulary_id):
        terms = [u'{0} {1}'.format(t['lastname'], t['firstname'])
                 for t in getVocabulary(vocabulary_id)]
        terms = sorted(list(set(terms)))
        return terms

    @ram.cache(getProjectKey)
    def getCode(self, project):
        project = self.getFullProject(project)
        return project.getCode()

    @ram.cache(getProjectKey)
    def getName(self, project):
        project = self.getFullProject(project)
        if self.current_language == 'fr':
            return project.getName_fr()
        if self.current_language == 'en':
            return project.getName_en()
        if self.current_language == 'nl':
            return project.getName_nl()

    @ram.cache(getProjectKey)
    def getStatus(self, project):
        project = self.getFullProject(project)
        return project.getStatus()

    @ram.cache(getProjectKey)
    def getRelationType(self, project):
        project = self.getFullProject(project)
        relation = getTerm(
            'relationtype', project.getRelationtype()
        )
        if relation is None:
            return None
        return relation['id']

    @ram.cache(getProjectKey)
    def getOrganisationType(self, project):
        project = self.getFullProject(project)
        organisation = getTerm(
            'organisationtype', project.getOrganisationtype()
        )
        if organisation is None:
            return None
        return organisation['id']

    @ram.cache(getProjectKey)
    def getThemes(self, project):
        project = self.getFullProject(project)
        ids = project.getThemes()
        terms = getTerms('theme', ids)
        return [
            (
                term['id'], term['name']['en'],
                term['name']['fr'], term['name']['nl']
            )
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getKeywords(self, project):
        project = self.getFullProject(project)
        ids = project.getKeywords()
        terms = getTerms('keywords', ids)
        return [
            (
                term['id'], term['name']['en'],
                term['name']['fr'], term['name']['nl']
            )
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getCountries(self, project):
        project = self.getFullProject(project)
        ids = project.getCountries()
        terms = getTerms('country', ids)
        return [
            term['id']
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getRegions(self, project):
        project = self.getFullProject(project)
        ids = project.getRegions()
        terms = getTerms('region', ids)
        return [
            term['id']
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getCities(self, project):
        project = self.getFullProject(project)
        ids = project.getCities()
        terms = getTerms('city', ids)
        return [
            term['id']
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getContacts(self, project):
        project = self.getFullProject(project)
        ids = project.getContacts()
        terms = getTerms('contact', ids)
        return [
            u'{0} {1}'.format(term['lastname'], term['firstname'])
            for term in terms if term is not None
        ]

    @ram.cache(getProjectKey)
    def getOrganisations(self, project):
        project = self.getFullProject(project)
        ids = project.getContacts()
        contacts = getTerms('contact', ids)
        organisations = []
        for contact in contacts:
            orga = self.getContactOrganisation(contact)
            if orga and orga not in organisations:
                organisations.append(orga)
        #remove duplicates
        organisations = list(set(organisations))
        return organisations

    @ram.cache(getProjectKey)
    def getPartners(self, project):
        project = self.getFullProject(project)
        ids = project.getBrusselspartners()
        contacts = getTerms('brusselspartners', ids)
        organisations = []
        for contact in contacts:
            orga = self.getContactOrganisation(contact)
            if orga and orga not in organisations:
                organisations.append(orga)
        #remove duplicates
        organisations = list(set(organisations))
        return organisations

    def getFullProject(self, project):
        if self._project is None or self._project.getId() != project.getId:
            self._project = project.getObject()
        return self._project
