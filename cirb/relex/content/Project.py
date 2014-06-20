from zope.interface import implements

from AccessControl import ClassSecurityInfo
from Products.Archetypes import public as atapi
from Products.ATContentTypes import atct
from Products.ATContentTypes.content.schemata import finalizeATCTSchema

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


class Project(atct.ATCTContent):
    """Project content type.
    """

    implements(IProject)

    schema = ProjectSchema

    security = ClassSecurityInfo()

atapi.registerType(Project, 'cirb.relex')
