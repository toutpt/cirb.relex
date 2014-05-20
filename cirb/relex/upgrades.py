from Products.CMFCore.utils import getToolByName
PROFILE = 'profile-cirb.relex:default'


def common(context):
    setup = getToolByName(context, 'portal_setup')
    setup.runAllImportStepsFromProfile(PROFILE)
