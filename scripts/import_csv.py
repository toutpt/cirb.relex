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


# ================= CONTINENTS COUNTRIES REGIONS CITIES =============

def _import_continents(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "code": cell[8].decode('latin-1'),
            "description": {
                "fr": cell[4].decode('latin-1'),
                "en": cell[6].decode('latin-1'),
                "nl": cell[3].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.continent'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported continents.')


def _import_countries(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "code": cell[5].decode('latin-1'),
            "continent": cell[9].decode('latin-1'),
            "name": {
                "fr": cell[2].decode('latin-1'),
                "en": cell[7].decode('latin-1'),
                "nl": cell[4].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.country'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported countries.')


def _import_regions(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "country": cell[8].decode('latin-1'),
            "name": {
                "fr": cell[4].decode('latin-1'),
                "en": cell[6].decode('latin-1'),
                "nl": cell[5].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.region'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported regions.')


def _import_cities(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "country": cell[9].decode('latin-1'),
            "region": cell[8].decode('latin-1'),
            "name": {
                "fr": cell[3].decode('latin-1'),
                "en": cell[1].decode('latin-1'),
                "nl": cell[6].decode('latin-1'),
                },
            }
        terms.append(term)
    key = KEY_STORAGE + '.city'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported cities.')


# ================= CELLS ORGANIZATIONS FUNCTIONS CONTACTS  =================

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


def _import_organisation_types(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "code": {
                "fr": cell[1].decode('latin-1'),
                "en": cell[10].decode('latin-1'),
                "nl": cell[5].decode('latin-1'),
                },
            "name": {
                "fr": cell[4].decode('latin-1'),
                "en": cell[6].decode('latin-1'),
                "nl": cell[2].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.organisationtype'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported organisation types.')


def _import_organisations(cells, cells_orgs, relex_web):
    cells_orgs_dict = {}
    for row in cells_orgs:
        if row[1] not in cells_orgs_dict.keys():
            cells_orgs_dict[row[1]] = [row[0]]
        else:
            cells_orgs_dict[row[1]].append([row[0]])
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "organisationtype": cell[12].decode('latin-1'),
            "url": cell[1].decode('latin-1'),
            "cell": cells_orgs_dict.get(cell[0], []),
            "code": {
                "fr": cell[5].decode('latin-1'),
                "en": cell[9].decode('latin-1'),
                "nl": cell[4].decode('latin-1'),
                },
            "name": {
                "fr": cell[11].decode('latin-1'),
                "en": cell[8].decode('latin-1'),
                "nl": cell[2].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.organisation'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported organisation.')


def _import_functions(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "code": {
                "fr": cell[1].decode('latin-1'),
                "en": cell[6].decode('latin-1'),
                "nl": cell[4].decode('latin-1'),
                },
            "description": {
                "fr": cell[7].decode('latin-1'),
                "en": cell[8].decode('latin-1'),
                "nl": cell[2].decode('latin-1'),
                }
            }
        terms.append(term)
    key = KEY_STORAGE + '.function'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported functions.')


def _import_contacts(cells, relex_web):
    ct_terms = []
    pb_terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "lastname": cell[4].decode('latin-1'),
            "firstname": cell[8].decode('latin-1'),
            "phone": cell[6].decode('latin-1'),
            "email": cell[7].decode('latin-1'),
            "organisation": cell[10].decode('latin-1'),
            "cell": cell[11].decode('latin-1'),
            "function": cell[9].decode('latin-1'),
            }
        if cell[12] == 'CT':
            ct_terms.append(term)
        else:
            del term["function"]
            pb_terms.append(term)
    key = KEY_STORAGE + '.contact'
    setattr(relex_web, key, json.dumps(ct_terms))
    print('Imported contacts.')
    key = KEY_STORAGE + '.brusselspartners'
    setattr(relex_web, key, json.dumps(pb_terms))
    print('Imported brussels partners.')


# ================= Keywords Themes  =====================

def _import_keywords(cells, relex_web):
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "name": {
                "fr": cell[2].decode('latin-1'),
                "en": cell[6].decode('latin-1'),
                "nl": cell[3].decode('latin-1'),
                },
            }
        terms.append(term)
    key = KEY_STORAGE + '.keywords'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported keywords.')


def _import_themes(cells, cells_keywords, relex_web):
    cells_keywords_dict = {}
    for row in cells_keywords:
        if row[1] not in cells_keywords_dict.keys():
            cells_keywords_dict[row[1]] = [row[0]]
        else:
            cells_keywords_dict[row[1]].append([row[0]])
    terms = []
    for cell in cells:
        term = {
            "id": cell[0].decode('latin-1'),
            "keywords": cells_keywords_dict.get(cell[0], []),
            "name": {
                "fr": cell[1].decode('latin-1'),
                "en": cell[3].decode('latin-1'),
                "nl": cell[2].decode('latin-1'),
                },
            }
        terms.append(term)
    key = KEY_STORAGE + '.theme'
    setattr(relex_web, key, json.dumps(terms))
    print('Imported themes.')


# ================= Main method  =====================

def import_csv(relex_web, folder):
    csv_dict = get_csv_dict(folder)
    _import_continents(csv_dict['CONTINENTS'], relex_web)
    _import_countries(csv_dict['COUNTRIES'], relex_web)
    _import_regions(csv_dict['REGIONS'], relex_web)
    _import_cities(csv_dict['CITIES'], relex_web)

    _import_cells(csv_dict['CELLS'], relex_web)
    _import_organisation_types(csv_dict['ORGANIZATIONTYPES'], relex_web)
    _import_organisations(
        csv_dict['ORGANIZATIONS'], csv_dict['CELLS_ORAGANIZATIONS'], relex_web
        )
    _import_functions(csv_dict['FUNCTIONS'], relex_web)
    _import_contacts(csv_dict['CONTACTS'], relex_web)

    _import_keywords(csv_dict['KEYWORDS'], relex_web)
    _import_themes(
        csv_dict['THEMES'], csv_dict['KEYWORDS_THEMES'], relex_web
        )


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
