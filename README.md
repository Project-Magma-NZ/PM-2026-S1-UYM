# PM-2026-S1-UYM
## How to Run This Project

This project uses a `pyproject.toml` file to manage dependencies. You can use `uv` to set up the environment. Please, remember to install `uv` if you haven't already. [Link](https://docs.astral.sh/uv/#highlights) 

1. **Install UV**
For Mac and Linux:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

For Windows:
```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Afterward, you can verify the installation by running uv version:

```bash
uv version
```

2. **Clone the repository:**

```bash
git clone https://github.com/ProjectMagmaNZ/PM-2026-S1-UYM.git
cd PM-2026-S1-UYM
```

2. **Create a virtual environment using `pyproject.toml`:**

```bash
uv sync
```

_(Which will create its own .venv/, activate it, and install the dependencies in the `pyproject.toml` file.)_

Alternatively, activate the virtual environment

```bash
source .venv/bin/activate
```

3. **Create .env file:**

```bash
touch .env
```