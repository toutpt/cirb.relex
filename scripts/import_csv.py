#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script used to the CSVs in relex_web.
THIS WILL REMOVE EXISTING VOCABULARIES.
Launch as ./bin/instance run scripts/import_csv.py path_to_csv_folder
"""
import csv
import json
import os
import sys

from cirb.relex.browser.vocabulary import KEY_STORAGE, VOCABULARIES

CSVS = (
    'CELLS',
    'CELLS_ORAGANIZATIONS',
#    'CITIES_BACKUP',
    'CITIES',
    'CONTACTS',
    'CONTINENTS',
    'COUNTRIES',
    'FUNCTIONS',
    'KEYWORDS',
    'KEYWORDS_THEMES',
#    'KEYWORDS_TMP',
    'ORGANIZATIONS',
    'ORGANIZATIONTYPES',
#    'PROJECTS_CITIES_BACKUP',
    'PROJECTS_CITIES',
    'PROJECTS_CONTACTS',
    'PROJECTS_COUNTRIES',
    'PROJECTS',
    'PROJECTS_REGIONS',
    'PROJECTSTATUSES',
    'REGIONS',
    'RELATIONTYPES',
    'THEMES',
#    'THEMES_TMP',
    )


def get_csv_dict(folder):
    csv_dict = {}
    for csv_name in CSVS:
        path = os.path.join(folder, "{}.csv".format(csv_name))
        with open(path, 'r') as csv_file:
            reader = csv.reader(csv_file)
            # Remove header
            reader.next()
            csv_dict[csv_name] = []
            for row in reader:
                csv_dict[csv_name].append(row)
    return csv_dict


def _import_cells(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "code": {
                "fr": cell[9].decode('latin-1'),
                "en": cell[10].decode('latin-1'),
                "nl": cell[5].decode('latin-1'),
                },
            "description": {
                "fr": cell[4].decode('latin-1'),
                "en": cell[7].decode('latin-1'),
                "nl": cell[3].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.cell'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported cells.')


def import_csv(relex_web, folder):
    csv_dict = get_csv_dict(folder)
    _import_cells(csv_dict['CELLS'], relex_web)


if 'app' in locals():
    relex_web = app.restrictedTraverse('Plone').restrictedTraverse('relex_web')
    folder = len(sys.argv) > 1 and sys.argv[1] or '.'
    import_csv(relex_web, folder)

    relex_web._p_changed = 1
    # Commit transaction
    import transaction
    transaction.commit()
    # Perform ZEO client synchronization (if running in clustered mode)
    app._p_jar.sync()
