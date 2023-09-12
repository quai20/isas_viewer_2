FROM mambaorg/micromamba:1.5.1
COPY --chown=$MAMBA_USER:$MAMBA_USER env.yaml /tmp/env.yaml
RUN micromamba install -y -n base -f /tmp/env.yaml && \
    micromamba clean --all --yes

WORKDIR /python-docker
COPY --chown=$MAMBA_USER:$MAMBA_USER . .

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]

