# -*- coding: utf-8 -*-
__doc__ = """Manage projects for relex app


GET /relex_project -> JSON of all projects
POST /relex_project/:projectId create a new project
POST /relex_project/:projectId/update update the project
POST /relex_project/:projectId/delete delete the project

"""

import json
import logging
from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView
from zope.container.interfaces import INameChooser
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse

logger = logging.getLogger('relex')


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
        self.projectId = None
        self.project = None
        self._action = request['REQUEST_METHOD']
        self.payload = None
        self._index = None

    def publishTraverse(self, request, name):
        logger.info('publishTraverse ' + name)
        if self.projectId is None:
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
        if self.projectId is not None:
            self.project = self.context.restrictedTraverse(self.projectId)

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
            {"id": brain.id, "title": brain.Title}
            for brain in projects
        ]
        self._index = json.dumps(projects_list)

    def _getProject(self):
        """
        Return a specific project as json:
        {
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
        "brusselspartners": [],
        "country": [],
        "region": [],
        "city": [],
        "contact": [],
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
        project.setTitleFromData()
        self._index = project.getJSON()

    def _updateProject(self):
        """ Return newly updated project, see _getProject. """
        self.project.setFromJSON(self.payload)
        self._index = self.project.getJSON()

    def _deleteProject(self):
        """ Return 'deleted' if the delete is successfull """
        self.context.manage_delObjects([self.projectId])
        self._index = 'deleted'
