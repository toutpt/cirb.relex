# -*- coding: utf-8 -*-
__doc__ = """Store and Manage vocabularies for relex app


GET /relex_vocabulary -> JSON of all vocabularies with terms
POST /relex_vocabulary/:vocabId create a new entry in the vocabulary
PUT /relex_vocabulary/:vocabId/:termId update the entry
DELETE /relex_vocabulary/:vocabId/:termId

"""

import json
import logging
from Products.Five.browser import BrowserView
from zope.publisher.interfaces import IPublishTraverse
from zope.interface import implementer

KEY_STORAGE = '__cirb.relex.vocabulary'
logger = logging.getLogger('relex')


def add_json_header(response):
    response.setHeader(
        'Content-Type',
        'application/json; charset=utf-8'
    )


@implementer(IPublishTraverse)
class VocabularyJSON(BrowserView):
    """Return the vocabulary index"""
    path = []

    def __init__(self, context, request):
        self.context = context
        self.request = request
        self.vocabularies = VOCABULARIES['vocabularies']
        self.vocabularyID = None
        self.termID = None
        self._action = request['REQUEST_METHOD']
        self.payload = None
        self._index = None

    def __call__(self):
        self.update()
        return self.index()

    def _getVocabularyKey(self, vocabularyID):
        return KEY_STORAGE + '.' + vocabularyID

    def update(self):
        if self._action == 'GET':
            #load vocabularies terms
            for vocab in self.vocabularies:
                vocab["terms"] = self._getTerms(vocab['id'])
            self._index = json.dumps(self.vocabularies)

        if self._action == 'POST':
            self._updatePayload()
            if self.vocabularyID is None:
                raise ValueError("A new term must be in a vocabulary")
            self._createTerm()

        if self._action == 'PUT':
            self._updatePayload()
            if self.termID is None:
                raise ValueError("You can only update term")
            self._updateTerm()

        if self._action == 'DELETE':
            if self.termID is None:
                raise ValueError("You can only delete term")
            self._deleteTerm()

    def index(self):
        add_json_header(self.request.response)
        return self._index

    def publishTraverse(self, request, name):
        logger.info('publishTraverse '+ name)
        if self.vocabularyID is None:
            self.vocabularyID = name
        elif self.termID is None:
            self.termID = name
        elif self._action == "POST" and name == "update":
            self._action = "PUT"
        elif self._action == "POST" and name == "delete":
            self._action = "DELETE"
        return self

    def _getTerms(self, vocabularyID):
        key = self._getVocabularyKey(vocabularyID)
        return json.loads(getattr(self.context, key, "[]"))

    def _createTerm(self):
        terms = self._getTerms(self.vocabularyID)
        last_id = max([int(term['id']) for term in terms] or [0])
        term = json.loads(self.payload)

        term["id"] = u"%s" % unicode(last_id + 1)
        terms.append(term)
        self.dump(self.vocabularyID, terms)
        self._index = json.dumps(term)

    def _updateTerm(self):
        uterm = json.loads(self.payload)
        terms = self._getTerms(self.vocabularyID)
        for index, term in enumerate(terms):
            if term["id"] == self.termID:
                logger.info('update term')
                terms[index] = uterm
        self.dump(self.vocabularyID, terms)
        self._index = self.payload

    def _deleteTerm(self):
        terms = self._getTerms(self.vocabularyID)
        for term in terms:
            if term["id"] == self.termID:
                terms.remove(term)
        self.dump(self.vocabularyID, terms)
        self._index = 'deleted'

    def _updatePayload(self):
        self.payload = self.request._file.read()

    def dump(self, vocabularyID, terms):
        logger.info('dump %s %s' %(vocabularyID, terms))
        key = self._getVocabularyKey(vocabularyID)
        setattr(self.context, key, json.dumps(terms))
        self.context._p_changed = 1


VOCABULARIES = {
    "vocabularies":[
        {"name": "Continent", "id": "continent", "model": {
                "id": "",
                "code": "",
                "description": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
        },
        {"name": "Country", "id": "country", "model": {
                "id": "",
                "continent": "",
                "code": "",
                "name": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
        },
        {"name": "Region", "id": "region", "model": {
                "id": "",
                "name": {"fr": "", "en": "", "nl": ""},
                "country": ""
                },
         "terms":[]
        },
        {"name": "City", "id": "city", "model": {
                "id": "",
                "code": "V1",
                "name": {"fr": "", "en": "", "nl": ""},
                "country": "",
                "region": ""
                },
         "terms":[]
        },

        {"name": "Cell", "id": "cell", "model": {
                "id": "",
                "code": {"fr": "", "en": "", "nl": ""},
                "description": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
         },
        {"name": "Organisation type", "id": "organisationtype", "model": {
                "id": "",
                "code": {"fr": "", "en": "", "nl": ""},
                "name": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
        },
        {"name": "Organisation", "id": "organisation", "model": {
                "id": "",
                "organisationtype": "",
                "url": "",
                "cells": [],
                "code": {"fr": "", "en": "", "nl": ""},
                "name": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
        },
        {"name": "Function", "id": "function", "model": {
                "id": "",
                "code": {"fr": "", "en": "", "nl": ""},
                "description": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
        },
        {"name": "Contact", "id": "contact", "model": {
                "id": "",
                "lastname": "",
                "firstname": "",
                "phone": "",
                "email": "",
                "organisation": "",
                "cell": "",
                "function": ""
                },
         "terms": []
        },

        {"name": "Brussels Partners", "id": "brusselspartners", "model": {
                "id": "",
                "lastname": "",
                "firstname": "",
                "phone": "",
                "email": "",
                "organisation": "",
                "cell": ""
                },
         "terms": []
        },

        {"name": "Keywords", "id": "keywords", "model": {
                "id": "",
                "name": {"fr": "", "en": "", "nl": ""}
                },
         "terms":[]
        },
        {"name": "Theme", "id": "theme", "model": {
                "id": "",
                "name": {"fr": "", "en": "", "nl": ""},
                "keywords": [],
                },
         "terms":[]
        },
    ]
}
