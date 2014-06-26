import json

from zope.component.hooks import getSite

from cirb.relex.browser.vocabulary import KEY_STORAGE


def getTerm(vocabulary_id, term_id):
    if term_id is None:
        return None
    relex_web = getSite().restrictedTraverse('relex_web')
    key = KEY_STORAGE + "." + vocabulary_id
    vocabulary = json.loads(getattr(relex_web, key, "[]"))
    for term in vocabulary:
        if term['id'] == term_id:
            return term
    return None


def getTerms(vocabulary_id, terms_id):
    return [getTerm(vocabulary_id, term_id) for term_id in terms_id]
