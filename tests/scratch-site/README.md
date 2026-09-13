# Scratch site

Minimal Starlight site used by CI to build against a real Starlight install with
the plugin loaded. CI packs the plugin from the repo root, installs the tarball
here, builds the site, and inspects `dist/` for the injected theme-sync script.
