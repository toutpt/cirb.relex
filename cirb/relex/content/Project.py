import json

from AccessControl import ClassSecurityInfo
from DateTime import DateTime
from Products.Archetypes import public as atapi
from Products.ATContentTypes import atct
from Products.ATContentTypes.content.schemata import finalizeATCTSchema
from zope.interface import implements

from cirb.relex.interfaces import IProject


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
            'status',
            widget=atapi.StringWidget(
                label=u'Status',
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
                macro="project_lines",
            ),
        ),

        atapi.LinesField(
            'countries',
            widget=atapi.LinesWidget(
                label=u"Countries",
                i18n_domain="cirb.relex",
                macro="project_lines",
            ),
        ),

        atapi.LinesField(
            'regions',
            widget=atapi.LinesWidget(
                label=u"Regions",
                i18n_domain="cirb.relex",
                macro="project_lines",
            ),
        ),

        atapi.LinesField(
            'cities',
            widget=atapi.LinesWidget(
                label=u"Cities",
                i18n_domain="cirb.relex",
                macro="project_lines",
            ),
        ),

        atapi.LinesField(
            'contacts',
            widget=atapi.LinesWidget(
                label=u"Contacts",
                i18n_domain="cirb.relex",
                macro="project_lines",
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

    def getJSON(self):
        project_json = {}
        project_json['id'] = self.id
        project_json['title'] = self.Title()
        project_json['code'] = self.code
        project_json['name'] = {
            'fr': self.name_fr,
            'en': self.name_en,
            'nl': self.name_nl,
        }
        project_json['content'] = {
            'fr': self.content_fr.getRaw(),
            'en': self.content_en.getRaw(),
            'nl': self.content_nl.getRaw(),
        }
        if self.start is not None:
            project_json['start'] = self.start.strftime('%Y-%m-%d')
        else:
            project_json['start'] = None
        if self.end is not None:
            project_json['end'] = self.end.strftime('%Y-%m-%d')
        else:
            project_json['end'] = None
        project_json['url'] = self.url
        project_json['status'] = self.status
        project_json['relationtype'] = self.relationtype
        project_json['organisationtype'] = self.organisationtype
        project_json['comments'] = self.comments.raw
        project_json['brusselspartners'] = self.brusselspartners
        project_json['country'] = self.countries
        project_json['region'] = self.regions
        project_json['city'] = self.cities
        project_json['contact'] = self.contacts
        return json.dumps(project_json)

    security.declarePublic("setFromJSON")

    def setFromJSON(self, project_json):
        project_json = json.loads(project_json)
        self.code = project_json.get('code', '')
        self.name_fr = project_json.get('name', {}).get('fr', '')
        self.name_en = project_json.get('name', {}).get('en', '')
        self.name_nl = project_json.get('name', {}).get('nl', '')
        self.content_fr.raw = project_json.get('content', {}).get('fr', '')
        self.content_en.raw = project_json.get('content', {}).get('en', '')
        self.content_nl.raw = project_json.get('content', {}).get('nl', '')
        if project_json.get('start', None):
            self.start = DateTime(project_json.get('start', ''))
        else:
            self.start = None
        if project_json.get('end', None):
            self.end = DateTime(project_json.get('end', ''))
        else:
            self.end = None
        self.url = project_json.get('url', '')
        self.status = project_json.get('status', '')
        self.relationtype = project_json.get('relationtype', '')
        self.organisationtype = project_json.get('organisationtype', '')
        self.comments.raw = project_json.get('comments', '')
        self.brusselspartners = project_json.get('brusselspartners', tuple())
        self.countries = project_json.get('country', tuple())
        self.regions = project_json.get('region', tuple())
        self.cities = project_json.get('city', tuple())
        self.contacts = project_json.get('contact', tuple())
        # Set title and reindex
        self.setTitleFromData()
        self.reindexObject()

atapi.registerType(Project, 'cirb.relex')
