import json

from zope.component.hooks import getSite

from cirb.relex.browser.vocabulary import KEY_STORAGE


def getVocabulary(vocabulary_id):
    """ Get all terms from a specific vocabulary """
    relex_web = getSite().restrictedTraverse('relex_web')
    key = KEY_STORAGE + "." + vocabulary_id
    vocabulary = json.loads(getattr(relex_web, key, "[]"))
    return vocabulary


def getTerm(vocabulary_id, term_id):
    """ Get a term from a specific vocabulary id and term id """
    if term_id is None:
        return None
    vocabulary = getVocabulary(vocabulary_id)
    for term in vocabulary:
        if term['id'] == term_id:
            return term
    return None


def getTerms(vocabulary_id, terms_id):
    """
    Get a list of terms from a specific vocabulary id
    and a list of terms id
    """
    return [getTerm(vocabulary_id, term_id) for term_id in terms_id]
