# -*- coding: utf-8 -*-
__doc__ = """Manage projects for relex app


GET /relex_project -> JSON of all projects
POST /relex_project/:projectId create a new project
POST /relex_project/:projectId/update update the project
POST /relex_project/:projectId/delete delete the project

"""

import json
import logging
from Acquisition import aq_parent
from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView
from zope.component import getMultiAdapter
from zope.container.interfaces import INameChooser
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse

from cirb.relex.content.vocabularies import getTerm, getTerms
from cirb.relex.i18n import _

logger = logging.getLogger('relex')


class ProjectView(BrowserView):
    def __call__(self):
        self.update()
        return self.index()

    def update(self):
        context = self.context.aq_inner
        portal_state = getMultiAdapter((context, self.request),
                                       name=u'plone_portal_state')
        self.current_language = portal_state.language()

    def getName(self):
        if self.current_language == 'fr':
            return self.context.getName_fr()
        if self.current_language == 'en':
            return self.context.getName_en()
        if self.current_language == 'nl':
            return self.context.getName_nl()

    def getStart(self):
        return self.context.getStart()

    def getEnd(self):
        return self.context.getEnd()

    def getUrl(self):
        url = self.context.getUrl()
        if not url.startswith('http'):
            url = 'http://{0}'.format(url)
        return url

    def getStatus(self):
        STATUS = {
            'active': _('Active'),
            'inactive': _('Inactive'),
            'archive': _('Archive'),
        }
        return STATUS.get(self.context.getStatus(), '')

    def getRelationType(self):
        relation = getTerm(
            'relationtype', self.context.getRelationtype()
        )
        if relation is None:
            return None
        return relation['name'].get(self.current_language, None)

    def getOrganisationType(self):
        organisation = getTerm(
            'organisationtype', self.context.getOrganisationtype()
        )
        if organisation is None:
            return None
        return organisation['name'].get(self.current_language, None)

    def getContent(self):
        if self.current_language == 'fr':
            return self.context.getContent_fr()
        if self.current_language == 'en':
            return self.context.getContent_en()
        if self.current_language == 'nl':
            return self.context.getContent_nl()

    def getComments(self):
        return self.context.getComments()

    def getThemes(self):
        ids = self.context.getThemes()
        terms = getTerms('theme', ids)
        return sorted([
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ])

    def getKeywords(self):
        ids = self.context.getKeywords()
        terms = getTerms('keywords', ids)
        return sorted([
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ])

    def getCountries(self):
        ids = self.context.getCountries()
        terms = getTerms('country', ids)
        return sorted([
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ])

    def getRegions(self):
        ids = self.context.getRegions()
        terms = getTerms('region', ids)
        return sorted([
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ])

    def getCities(self):
        ids = self.context.getCities()
        terms = getTerms('city', ids)
        return sorted([
            term['name'].get(self.current_language, None)
            for term in terms if term is not None
        ])

    def getBrusselsPartners(self):
        ids = self.context.getBrusselspartners()
        terms = getTerms('brusselspartners', ids)
        terms = [term for term in terms if term is not None]
        for term in terms:
            for id in ('organisation', 'cell'):
                term[id] = getTerm(id, term[id])
            if term['organisation'] is not None:
                term['organisation'] = term['organisation']['name']\
                    .get(self.current_language, '')
            if term['cell'] is not None:
                term['cell'] = term['cell']['description']\
                    .get(self.current_language, '')
        return terms

    def getContacts(self):
        ids = self.context.getContacts()
        terms = getTerms('contact', ids)
        terms = [term for term in terms if term is not None]
        for term in terms:
            for id in ('organisation', 'cell', 'function'):
                term[id] = getTerm(id, term[id])
            if term['organisation'] is not None:
                term['organisation'] = term['organisation']['name']\
                    .get(self.current_language, '')
            if term['cell'] is not None:
                term['cell'] = term['cell']['description']\
                    .get(self.current_language, '')
            if term['function'] is not None:
                term['function'] = term['function']['code']\
                    .get(self.current_language, '')
        return terms

    def getFiles(self):
        contentFilter = {"portal_type": "File"}
        return self.context.getFolderContents(contentFilter)

    def getSubProjects(self):
        contentFilter = {"portal_type": "Project"}
        return self.context.getFolderContents(contentFilter)


def add_json_header(response):
    response.setHeader(
        'Content-Type',
        'application/json; charset=utf-8'
    )


@implementer(IPublishTraverse)
class ProjectJSON(BrowserView):
    """Return the projects index"""
    path = []

    def __init__(self, context, request):
        self.context = context
        self.request = request
        self.status = False
        self.projectId = None
        self.project = None
        self._action = request['REQUEST_METHOD']
        self.payload = None
        self._index = None

    def publishTraverse(self, request, name):
        logger.info('publishTraverse ' + name)
        if self._action == "GET" and name == 'status':
            self.status = True
        elif self.projectId is None:
            self.projectId = name
        elif self._action == "POST" and name == "update":
            self._action = "PUT"
        elif self._action == "POST" and name == "delete":
            self._action = "DELETE"
        return self

    def __call__(self):
        self.update()
        return self.index()

    def update(self):
        if self.status:
            self._getStatus()
            return

        if self.projectId is not None:
            reference_catalog = getToolByName(
                self.context, 'reference_catalog'
            )
            self.project = reference_catalog.lookupObject(self.projectId)

        if self._action == 'GET' and self.projectId is None:
            self.catalog = getToolByName(self.context, 'portal_catalog')
            self._getProjects()

        if self._action == 'GET' and self.projectId is not None:
            self._getProject()

        if self._action == 'POST':
            self._updatePayload()
            self._createProject()

        if self._action == 'PUT':
            if self.project is None:
                raise ValueError("No project provided")
            self._updatePayload()
            self._updateProject()

        if self._action == 'DELETE':
            if self.project is None:
                raise ValueError("No project provided")
            self._deleteProject()

    def index(self):
        add_json_header(self.request.response)
        return self._index

    def _updatePayload(self):
        self.payload = self.request._file.read()

    def _getStatus(self):
        """ Return state of the cirb_relex_project_workflow workflow """
        wtool = getToolByName(self.context, 'portal_workflow')
        workflow = wtool.getWorkflowById('cirb_relex_project_workflow')
        states = {
            state_id: state.title
            for state_id, state in workflow.states.items()
        }
        self._index = json.dumps(states)

    def _getProjects(self):
        """
        Return the list of all projects as json:
        [{
          "id": "", "title": "",
        },
        {
          [...]
        }]
        """
        projects = self.catalog(portal_type='Project')
        projects_list = [
            {"id": brain.UID, "title": brain.Title}
            for brain in projects
        ]
        self._index = json.dumps(projects_list)

    def _getProject(self):
        """
        Return a specific project as json:
        {
        "absolute_url": "",
        "id": "",
        "name": {"fr": "", "en": "", "nl": ""},
        "content": {"fr": "", "en": "", "nl": ""},
        "start": "",
        "end": "",
        "url": "",
        "status": "",
        "relationtype": "",
        "organisationtype": "",
        "comments": "",
        "theme": [],
        "keywords": [],
        "brusselspartners": [],
        "country": [],
        "region": [],
        "city": [],
        "contact": [],
        "files": [{'name': '', 'url': ''}, {...}],
        }
        """
        self._index = self.project.getJSON()

    def _createProject(self):
        """ Return newly created project, see _getProject. """
        code = json.loads(self.payload)['code']
        chooser = INameChooser(self.context)
        project_id = chooser.chooseName(code, self.context)
        self.context.invokeFactory("Project", project_id)
        project = self.context[project_id]
        project.setFromJSON(self.payload)
        self._index = project.getJSON()

    def _updateProject(self):
        """ Return newly updated project, see _getProject. """
        self.project.setFromJSON(self.payload)
        self._index = self.project.getJSON()

    def _deleteProject(self):
        """ Return 'deleted' if the delete is successfull """
        parent = aq_parent(self.project)
        parent.manage_delObjects([self.project.id])
        self._index = 'deleted'
