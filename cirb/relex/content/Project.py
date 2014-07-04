import json
import logging

from AccessControl import ClassSecurityInfo
from DateTime import DateTime
from Products.Archetypes import public as atapi
from Products.ATContentTypes import atct
from Products.ATContentTypes.content.schemata import finalizeATCTSchema
from Products.CMFPlone.utils import getToolByName
from zope.interface import implements

from cirb.relex.interfaces import IProject

logger = logging.getLogger('cirb.relex')


ProjectSchema = atct.ATContentTypeSchema.copy() + atapi.Schema(
    (
        atapi.StringField(
            'code',
            widget=atapi.StringWidget(
                label=u'Code',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'name_fr',
            widget=atapi.StringWidget(
                label=u'Name FR',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'name_en',
            widget=atapi.StringWidget(
                label=u'Name EN',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'name_nl',
            widget=atapi.StringWidget(
                label=u'Name NL',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.DateTimeField(
            'start',
            widget=atapi.CalendarWidget(
                label=u'Start',
                show_hm=False,
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.DateTimeField(
            'end',
            widget=atapi.CalendarWidget(
                label=u'End',
                show_hm=False,
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'url',
            widget=atapi.StringWidget(
                label=u'URL',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'relationtype',
            widget=atapi.StringWidget(
                label=u'Relation type',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'organisationtype',
            widget=atapi.StringWidget(
                label=u'Organisation type',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.TextField(
            'content_fr',
            widget=atapi.TextAreaWidget(
                label=u"Content FR",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.TextField(
            'content_en',
            widget=atapi.TextAreaWidget(
                label=u"Content EN",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.TextField(
            'content_nl',
            widget=atapi.TextAreaWidget(
                label=u"Content NL",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.TextField(
            'comments',
            widget=atapi.TextAreaWidget(
                label=u"Comments",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.LinesField(
            'brusselspartners',
            widget=atapi.LinesWidget(
                label=u"Brussels partners",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.LinesField(
            'countries',
            widget=atapi.LinesWidget(
                label=u"Countries",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.LinesField(
            'regions',
            widget=atapi.LinesWidget(
                label=u"Regions",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.LinesField(
            'cities',
            widget=atapi.LinesWidget(
                label=u"Cities",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.LinesField(
            'contacts',
            widget=atapi.LinesWidget(
                label=u"Contacts",
                i18n_domain="cirb.relex",
            ),
        ),
    ),
    marshall=atapi.RFC822Marshaller()
)
finalizeATCTSchema(ProjectSchema)


class Project(atct.ATCTOrderedFolder):
    """Project content type.
    """

    implements(IProject)

    schema = ProjectSchema
    security = ClassSecurityInfo()

    security.declarePublic("setTitleFromData")

    def setTitleFromData(self):
        self.setTitle(u"{code}".format(code=self.code))
        self.reindexObject(idxs=["Title"])

    security.declarePublic("getJSON")

    def getStatus(self):
        wtool = getToolByName(self, 'portal_workflow')
        status = wtool.getStatusOf('cirb_relex_project_workflow', self)
        if status is None:
            return ''
        return status['review_state']

    def setStatus(self, status):
        TRANSITION = {
            'active': 'activate',
            'inactive': 'deactivate',
            'archive': 'archive',
        }
        if status not in TRANSITION.keys():
            logger.warn('Unknown status {0}'.format(status))
            return
        if self.getStatus() == status:
            return
        wtool = getToolByName(self, 'portal_workflow')
        wtool.doActionFor(self, TRANSITION[status])

    def getJSON(self):
        project_json = {}
        project_json['id'] = self.UID()
        project_json['title'] = self.Title()
        project_json['code'] = self.getCode()
        project_json['name'] = {
            'fr': self.getName_fr(),
            'en': self.getName_en(),
            'nl': self.getName_nl(),
        }
        project_json['content'] = {
            'fr': self.getContent_fr(),
            'en': self.getContent_en(),
            'nl': self.getContent_nl(),
        }
        if self.getStart() is not None:
            project_json['start'] = self.getStart().strftime('%Y-%m-%d')
        else:
            project_json['start'] = None
        if self.getEnd() is not None:
            project_json['end'] = self.getEnd().strftime('%Y-%m-%d')
        else:
            project_json['end'] = None
        project_json['url'] = self.getUrl()
        project_json['status'] = self.getStatus()
        project_json['relationtype'] = self.getRelationtype()
        project_json['organisationtype'] = self.getOrganisationtype()
        project_json['comments'] = self.getComments()
        project_json['brusselspartners'] = self.getBrusselspartners()
        project_json['country'] = self.getCountries()
        project_json['region'] = self.getRegions()
        project_json['city'] = self.getCities()
        project_json['contact'] = self.getContacts()
        return json.dumps(project_json)

    security.declarePublic("setFromJSON")

    def setFromJSON(self, project_json):
        project_json = json.loads(project_json)
        self.setCode(project_json.get('code', ''))
        self.setName_fr(project_json.get('name', {}).get('fr', ''))
        self.setName_en(project_json.get('name', {}).get('en', ''))
        self.setName_nl(project_json.get('name', {}).get('nl', ''))
        self.setContent_fr(project_json.get('content', {}).get('fr', ''))
        self.setContent_en(project_json.get('content', {}).get('en', ''))
        self.setContent_nl(project_json.get('content', {}).get('nl', ''))
        if project_json.get('start', None):
            self.setStart(DateTime(project_json.get('start', '')))
        else:
            self.setStart(None)
        if project_json.get('end', None):
            self.setEnd(DateTime(project_json.get('end', '')))
        else:
            self.setEnd(None)
        self.setUrl(project_json.get('url', ''))
        self.setStatus(project_json.get('status', ''))
        self.setRelationtype(project_json.get('relationtype', ''))
        self.setOrganisationtype(project_json.get('organisationtype', ''))
        self.setComments(project_json.get('comments', ''))
        self.setBrusselspartners([
            t['id'] for t in project_json.get('brusselspartners', tuple())
        ])
        self.setCountries([
            t['id'] for t in project_json.get('country', tuple())
        ])
        self.setRegions([
            t['id'] for t in project_json.get('region', tuple())
        ])
        self.setCities([
            t['id'] for t in project_json.get('city', tuple())
        ])
        self.setContacts([
            t['id'] for t in project_json.get('contact', tuple())
        ])
        # Set title and reindex
        self.setTitleFromData()
        self.reindexObject()

atapi.registerType(Project, 'cirb.relex')
