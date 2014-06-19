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
                label='Code',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'name_fr',
            widget=atapi.StringWidget(
                label='Name FR',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'name_en',
            widget=atapi.StringWidget(
                label='Name EN',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'name_nl',
            widget=atapi.StringWidget(
                label='Name NL',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.DateTimeField(
            'start',
            widget=atapi.CalendarWidget(
                label='Start',
                show_hm=False,
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.DateTimeField(
            'end',
            widget=atapi.CalendarWidget(
                label='End',
                show_hm=False,
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'url',
            widget=atapi.StringWidget(
                label='URL',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'status',
            widget=atapi.StringWidget(
                label='Status',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'relationtype',
            widget=atapi.StringWidget(
                label='Relation type',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.StringField(
            'organisationtype',
            widget=atapi.StringWidget(
                label='Organisation type',
                i18n_domain='cirb.relex',
            ),
        ),

        atapi.TextField(
            'content_fr',
            widget=atapi.TextAreaWidget(
                label="Content FR",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.TextField(
            'content_en',
            widget=atapi.TextAreaWidget(
                label="Content EN",
                i18n_domain="cirb.relex",
            ),
        ),

        atapi.TextField(
            'content_nl',
            widget=atapi.TextAreaWidget(
                label="Content NL",
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
