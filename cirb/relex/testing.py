from plone.app.testing import (
    PloneWithPackageLayer,
    IntegrationTesting,
    FunctionalTesting,
)
from plone.app.robotframework.testing import AUTOLOGIN_LIBRARY_FIXTURE
from plone.testing import z2
import cirb.relex


FIXTURE = PloneWithPackageLayer(
    zcml_filename="configure.zcml",
    zcml_package=cirb.relex,
    additional_z2_products=[],
    gs_profile_id='cirb.relex:default',
    name="cirb.relex:FIXTURE"
)

INTEGRATION = IntegrationTesting(
    bases=(FIXTURE,),
    name="cirb.relex:Integration"
)

FUNCTIONAL = FunctionalTesting(
    bases=(FIXTURE,),
    name="cirb.relex:Functional"
)

ROBOT = FunctionalTesting(
    bases=(AUTOLOGIN_LIBRARY_FIXTURE, FIXTURE, z2.ZSERVER),
    name="cirb.relex:Robot"
)
