FROM dockurr/strfry:latest

USER root

# Node installieren — Paketmanager je nach Base wählen.
# dockurr/strfry ist Ubuntu-basiert (apt).
RUN apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*
