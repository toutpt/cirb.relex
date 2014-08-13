#!/bin/sh

../../bin/i18ndude rebuild-pot --pot locales/cirb.relex.pot --create cirb.relex .

../../bin/i18ndude sync --pot locales/cirb.relex.pot locales/fr/LC_MESSAGES/cirb.relex.po
../../bin/i18ndude sync --pot locales/cirb.relex.pot locales/en/LC_MESSAGES/cirb.relex.po
../../bin/i18ndude sync --pot locales/cirb.relex.pot locales/nl/LC_MESSAGES/cirb.relex.po
