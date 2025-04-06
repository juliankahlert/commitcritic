# CommitCritic GitHub Action

## Overview

**CommitCritic** is a GitHub Action that automates code review discussions using the OpenAI API. By interacting with GitHub pull requests, it provides intelligent insights via an OpenAI model. 

You can have interactive, context-sensitive discussions with the AI on pull request review comments. The AI will intelligently reply to your follow-up comments, maintaining context throughout the conversation. This action is designed to assist in reviewing and discussing pull requests, providing an additional layer of automated intelligence to enhance the review process.

## Features
- Automatically analyzes pull request reviews using an OpenAI model.
- Provides intelligent suggestions and insights for code changes.
- Interactive, context-sensitive AI responses to follow-up comments.
- Flexible configuration through GitHub Action inputs.

## Inputs

The `CommitCritic` action accepts the following inputs:

### `BOT_TOKEN`
- **Required**: Yes
- **Description**: GitHub token (usually a bot token or a personal access token) used to interact with the repository. This is required for authentication to make API calls to the GitHub repository.

### `OPENAI_API_KEY`
- **Required**: Yes
- **Description**: Your OpenAI API key to authenticate and interact with OpenAI models.

### `OPENAI_API_MODEL`
- **Required**: No (defaults to `gpt-4o-mini-2024-07-18`)
- **Description**: The OpenAI model to use for generating responses. By default, it uses the `gpt-4o-mini-2024-07-18` model, but you can specify other available models like `gpt-4`, `gpt-3.5-turbo`, etc.

### `exclude`
- **Required**: No (defaults to an empty string)
- **Description**: Glob patterns to exclude certain files from the diff analysis. This is useful to avoid including specific files or directories (e.g., use `**/*.md` to exclude markdown files from the review).

## Usage

To use this action in your workflow, you need to define it in your GitHub Actions workflow file. Below is an example of how to include it in a workflow file (`.github/workflows/review.yml`):

### Example Workflow:

```yaml
name: CommitCritic
permissions: write-all
on:
  pull_request_review_comment:
    types:
    - created
  pull_request:
    types:
    - synchronize
    - opened
jobs:
  commitcritic:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Repo
      uses: actions/checkout@v3
    - name: AI Review Bot
      uses: juliankahlert/commitcritic@main
      with:
        BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        OPENAI_API_MODEL: gpt-4o-mini-2024-07-18
        exclude: "**/*.json, **/*.md, **/*.lock"
```

### How It Works:

1. **Triggered by Pull Request Events**: The action is triggered whenever a pull request is created, edited, synchronized, or reopened.
2. **Bot Token for Authentication**: The `BOT_TOKEN` is used to authenticate and make GitHub API calls to interact with the pull request.
3. **OpenAI Model for Insights**: The `OPENAI_API_KEY` and `OPENAI_API_MODEL` are used to authenticate and communicate with OpenAI's GPT models. The model provides intelligent code reviews and suggestions based on the pull request diff.
4. **Exclusion Patterns**: Optionally, you can use the `exclude` parameter to specify files or patterns that should be ignored by the action during the review process.

## Example of an Interactive AI Review

1. **Initial Review Comment**: The action comments on the pull request with insights, suggestions, or feedback based on the changes in the pull request diff.
2. **Context-Sensitive Discussion**: If someone replies to the AI's comment, the AI responds intelligently, maintaining context and continuing the discussion. This is particularly useful for engaging in back-and-forth conversations with the AI for further code review feedback.

## Example Inputs

### Default:

```yaml
with:
  BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  OPENAI_API_MODEL: "gpt-4o-mini-2024-07-18"
  exclude: ""
```

### Custom Model:

```yaml
with:
  BOT_TOKEN: ${{ secrets.BOT_TOKEN }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  OPENAI_API_MODEL: "gpt-4o"
  exclude: "**/*.md"
```

## Outputs

- This action doesn’t produce direct outputs, but it will create comments on the pull request with its review and suggestions. You can view these comments in the GitHub pull request interface.

## Error Handling

If there’s an error with the GitHub API (e.g., due to an invalid token or API key), the action will fail and provide error logs in the action run output. Similarly, if there’s an issue with the OpenAI API (e.g., invalid API key or model), the action will notify you with relevant error messages.

## Additional Notes

- The action is designed to support pull requests in any repository.
- Make sure the `BOT_TOKEN` has the appropriate permissions for interacting with pull requests (e.g., read and write access to pull request comments).
- You can exclude specific files or directories from the diff analysis by providing glob patterns in the `exclude` input.

## License

This project is licensed under the MIT License.

## Contributing

Feel free to fork this repository and submit issues and pull requests for improvements!
Please adhere to the existing coding style and include tests where applicable.

## Credits
This project started as a fork of the abandoned [villesau/ai-codereviewer](https://github.com/villesau/ai-codereviewer).
However, as new features were added and the scope expanded, it quickly became evident that a complete rewrite was necessary before the first release to ensure a more robust and scalable solution.
