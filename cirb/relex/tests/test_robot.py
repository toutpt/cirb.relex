import unittest
import robotsuite
from plone.testing import layered
from cirb.relex.testing import ROBOT


def test_suite():
    suite = unittest.TestSuite()
    suite.addTests([
        layered(
            robotsuite.RobotTestSuite('test_robot.robot'),
            layer=ROBOT
        ),
    ])
    return suite
