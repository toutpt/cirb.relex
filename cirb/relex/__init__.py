from Products.Archetypes.public import listTypes, process_types
from Products.CMFCore.utils import ContentInit


def initialize(context):
    from cirb.relex import content
    content  # pyflakes

    content_types, constructors, ftis = process_types(
        listTypes('cirb.relex'), 'cirb.relex'
    )

    ContentInit(
        'cirb.relex Content',
        content_types=content_types,
        permission='cirb.relex: Add Project',
        extra_constructors=constructors,
        fti=ftis,
    ).initialize(context)
