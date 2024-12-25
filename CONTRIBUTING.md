# Contributing to Alien React Signals

First off, thank you for considering contributing to **Alien React Signals**! 🎉 Your help is greatly appreciated and will make this project better for everyone.

The following is a set of guidelines for contributing to Alien React Signals, which are intended to make the process smooth and efficient for everyone involved.

## Table of Contents

<details>
    <summary>Click to expand</summary>

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Pull Requests](#pull-requests)
- [Style Guidelines](#style-guidelines)
- [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Running Tests](#running-tests)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Acknowledgements](#acknowledgements)

</details>

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and respectful environment for all contributors.

## How Can I Contribute?

### Reporting Bugs

If you find a bug in Alien React Signals, please open an issue detailing the problem. Include as much information as possible to help us reproduce and fix the issue.

1. **Search existing issues** to see if the bug has already been reported.
2. If not, click on **"New Issue"**.
3. Choose the appropriate template (Bug Report).
4. Fill in the necessary details:
   - **Description**: A clear and concise description of the bug.
   - **Steps to Reproduce**: Detailed steps to help us understand and reproduce the issue.
   - **Expected Behavior**: What you expected to happen.
   - **Actual Behavior**: What actually happened.
   - **Environment**: Include information about your environment (OS, browser, version, etc.).
   - **Screenshots**: If applicable, add screenshots to help explain your problem.

### Suggesting Enhancements

We welcome suggestions for new features or improvements to Alien React Signals.

1. **Search existing issues** to see if your idea has already been proposed.
2. If not, click on **"New Issue"**.
3. Choose the appropriate template (Feature Request).
4. Provide a detailed description of the enhancement, including:
   - **Problem Statement**: What problem does this enhancement solve?
   - **Proposed Solution**: How do you envision this enhancement being implemented?
   - **Benefits**: Why is this enhancement beneficial?

### Pull Requests

Contributions via pull requests are highly encouraged! Here's how to make a good pull request:

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page.
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/your-username/alien-react-signals.git
   ```
3. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Your Changes**: Implement your feature or fix.
5. **Run Tests**: Ensure all tests pass before committing.
6. **Commit Your Changes**:
   ```bash
   git commit -m "Add feature: describe your feature"
   ```
7. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request**: Navigate to the original repository and click "Compare & pull request".

### Guidelines for Pull Requests

- **Follow the Code Style**: Ensure your code adheres to the project's style guidelines.
- **Write Clear Commit Messages**: Use descriptive commit messages that explain the "why" behind your changes.
- **Include Tests**: If applicable, add tests to cover your changes.
- **Update Documentation**: If your changes require updates to the documentation, please include them.
- **Be Responsive**: Engage in the discussion if reviewers have questions or feedback.

## Style Guidelines

- **Consistency**: Follow the existing code style for readability and maintainability.
- **TypeScript**: Ensure type safety and leverage TypeScript features effectively.
- **Naming Conventions**: Use clear and descriptive names for variables, functions, and components.
- **Documentation**: Provide JSDoc comments for public APIs and complex logic within the codebase.

## Setting Up the Development Environment

To set up the project locally for development and testing, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/alien-react-signals.git
   cd alien-react-signals
   ```
2. **Install Dependencies**:
   ```bash
   bun install
   ```
3. **Build the Project**:
   ```bash
   bun run build
   ```

## Running Tests

Ensure all tests pass before submitting a pull request.

1. **Run All Tests**:
   ```bash
   bun test
   ```
2. **Run Tests in Watch Mode**:
   ```bash
   bun test --watch
   ```
3. **Check Test Coverage**:
   ```bash
   bun test --coverage
   ```

## Commit Message Guidelines

Use clear and descriptive commit messages to make it easier to understand the history of changes.

- **Format**:
  ```
  [type]: [subject]
  
  [body]
  
  [footer]
  ```
- **Types**:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (no logic changes)
  - `refactor`: Code refactoring
  - `test`: Adding or updating tests
  - `chore`: Other changes (build process, dependencies, etc.)
  
- **Examples**:
  - `feat: add support for async computed signals`
  - `fix: resolve type errors in test suite`
  - `docs: update README with usage examples`

## Acknowledgements

- [Alien Signals](https://github.com/stackblitz/alien-signals) by [StackBlitz](https://stackblitz.com) for the foundational signal implementation.
- [Jotai](https://github.com/pmndrs/jotai) for inspiring the API design.
- [React](https://reactjs.org/) for the UI library integration.
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro) for the testing utilities.
- [Happy DOM](https://github.com/happy-dom/happy-dom) for the DOM environment in testing.
- [Bun](https://bun.sh/) for the fast JavaScript runtime and testing framework.

---

Thank you again for your interest in contributing to Alien React Signals! If you have any questions or need further assistance, feel free to reach out by opening an issue or contacting the maintainers directly.

Happy Coding! 🚀