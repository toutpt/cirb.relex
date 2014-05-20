from plone.app.testing import (
    PloneWithPackageLayer,
    IntegrationTesting,
    FunctionalTesting,
)
from plone.app.robotframework.testing import AUTOLOGIN_LIBRARY_FIXTURE
from plone.testing import z2
import cirb.relexe


FIXTURE = PloneWithPackageLayer(
    zcml_filename="configure.zcml",
    zcml_package=cirb.relexe,
    additional_z2_products=[],
    gs_profile_id='cirb.relexe:default',
    name="cirb.relexe:FIXTURE"
)

INTEGRATION = IntegrationTesting(
    bases=(FIXTURE,),
    name="cirb.relexe:Integration"
)

FUNCTIONAL = FunctionalTesting(
    bases=(FIXTURE,),
    name="cirb.relexe:Functional"
)

ROBOT = FunctionalTesting(
    bases=(AUTOLOGIN_LIBRARY_FIXTURE, FIXTURE, z2.ZSERVER),
    name="cirb.relexe:Robot"
)
