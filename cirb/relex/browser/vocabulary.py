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
        import pdb; pdb.set_trace()

    def __call__(self):
        import pdb; pdb.set_trace()
        self.update()
        return self.index()

    def _getVocabularyKey(self, vocabularyID):
        return KEY_STORAGE + '.' + vocabularyID

    def update(self):
        import pdb; pdb.set_trace()
        if self._action == 'GET':
            #load vocabularies terms
            for vocab in self.vocabularies:
                vocab["terms"] = self._getTerms(vocab['id'])

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

        import pdb; pdb.set_trace()
        if self._action == 'DELETE':
            if self.termID is None:
                raise ValueError("You can only delete term")
            self._deleteTerm()

    def index(self):
        add_json_header(self.request.response)
        return json.dumps(self.vocabularies)

    def publishTraverse(self, request, name):
        import pdb; pdb.set_trace()
        logger.info('publishTraverse '+ name)
        if self.vocabularyID is None:
            self.vocabularyID = name
        elif self.termID is None:
            self.termID = name
        # stop traversing, we have arrived
        #request['TraversalRequestNameStack'] = []
        # return self so the publisher calls this view
        return self

    def _getTerms(self, vocabularyID):
        key = self._getVocabularyKey(vocabularyID)
        return json.loads(getattr(self.context, key, "[]"))

    def _createTerm(self):
        term = json.loads(self.payload)
        terms = self._getTerms(self.vocabularyID)
        term.id = "%s" % len(terms) + 1
        terms.append(term)
        self.dump(self.vocabularyID, terms)

    def _updateTerm(self):
        term = json.loads(self.payload)
        terms = self._getTerms(self.vocabularyID)
        for index, term in enumerate(terms):
            if term.id == self.termID:
                terms[index] = term

    def _deleteTerm(self):
        import pdb; pdb.set_trace()
        terms = self._getTerms(self.vocabularyID)
        for term in terms:
            if term.id == self.termID:
                terms.remove(term)
        self.dump(self.vocabularyID, terms)

    def _updatePayload(self):
        self.payload = self.request._file.read()

    def dump(self, vocabularyID, terms):
        key = self._getVocabularyKey(vocabularyID)
        setattr(self.context, key, json.dumps(terms))


VOCABULARIES = {
    "vocabularies":[
        {"name": "Country", "id": "country", "model":{
            "id": "", "code": "", "name": {"fr": "", "en": "", "nl": ""}},
            "terms":[]
        },
        {"name": "Region", "id": "region", "model":{
            "id": "", "code": "", "name": {"fr": "", "en": "", "nl": ""},
            "country": ""}, "terms":[]
        },
        {"name": "City", "id": "city", "model": {
            "id": "", "code": "V1", "name": {"fr": "", "en": "", "nl": ""},
            "country": ""}, "terms":[]
        },
        {"name": "Cell", "id": "cell", "model":
            {
                "id": "", "code": {"fr": "", "en": "", "nl": ""},
                "description": {"fr": "", "en": "", "nl": ""}
            }, "terms":[]
        },
        {"name": "Organisation", "id": "organisation", "model": {
                "id": "", "code": {"fr": "", "en": "", "nl": ""},
                "name": {"fr": "", "en": "", "nl": ""}
            }, "terms":[]
        },
        {"name": "Contact", "id": "contact", "model": {
            "name": "", "firstname": "", "phone": "", "email": "", "organisation": "", "cell": "", "fonction": ""},
            "terms": []
        },
        {"name": "Brussels Partners", "id": "brusselspartners", "model": {
            "name": "", "firstname": "", "phone": "", "email": "", "organisation": "", "cell": ""},
            "terms": []
        },
        {"name": "Function", "id": "function", "model": {
            "id": "", "code": {"fr": "", "en": "", "nl": ""},
            "description": {"fr": "", "en": "", "nl": ""}}, "terms":[]
        },
        {"name": "Keywords", "id": "keywords", "model": {
                "word": {"fr": "", "en": "", "nl": ""}
            }, "terms":[]
        },
        {"name": "Theme", "id": "theme", "model": {
                "theme": {"fr": "", "en": "", "nl": "", "keywords": []}
            }, "terms":[]
        },
        {"name": "Continent", "id": "contient", "model": {
                "id": "", "code": "",
                "description": {"fr": "Afrique", "en": "", "nl": ""}
            }, "terms":[]
        },
        {"name": "Organisation type", "id": "organisationtype", "model": {
                "id": "", "code": {"fr": "", "en": "", "nl": ""},
                "name": {"fr": "", "en": "", "nl": ""}
            }, "terms":[]
        },
        {"name": "relation type", "id": "relationtype", "model": {
                "id": "", "code": {"fr": "", "en": "", "nl": ""},
                "name": {"fr": "", "en": "", "nl": ""}
            }, "terms":[]
        },
        {"name": "Continent", "id": "contient", "model": {
                "description": {"fr": "", "en": "", "nl": ""}
            }, "terms":[]
        }
    ]
}