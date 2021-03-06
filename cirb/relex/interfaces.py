from zope import interface


class ILayer(interface.Interface):
        """Browser layer"""


class IRelexBackend(interface.Interface):
        """Mark a folder as a storage backend for relex app"""


class IProject(interface.Interface):
        """Marker for Project content type"""
