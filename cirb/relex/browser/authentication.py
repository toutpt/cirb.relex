from Products.CMFPlone.utils import getToolByName
from Products.Five.browser import BrowserView


class CheckView(BrowserView):
    def __call__(self):
        mtool = getToolByName(self.context, 'portal_membership')
        if mtool.isAnonymousUser():
            return 'KO'
        return 'OK'
