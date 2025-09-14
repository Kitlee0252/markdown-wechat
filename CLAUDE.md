# CLAUDE.md
使用中文和用户交流。
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a markdown-to-WeChat converter tool that transforms standard Markdown files into WeChat-compatible HTML format. The project handles WeChat's specific styling requirements, image processing, and formatting constraints.

## Architecture

This project is in its initial setup phase. When implemented, it will likely follow this structure:

### Core Components
- **Parser Module**: Handles markdown parsing and syntax tree generation
- **WeChat Adapter**: Transforms parsed content to WeChat-compatible HTML
- **Style Engine**: Applies WeChat-specific CSS styling and constraints
- **Image Processor**: Handles image optimization and WeChat image requirements
- **Export Module**: Generates final output for WeChat publishing

### Expected Tech Stack
Based on similar projects, this will likely use:
- Node.js/JavaScript or Python for core processing
- Markdown parsing libraries (marked, markdown-it, or similar)
- HTML/CSS generation for WeChat formatting
- Image processing utilities for WeChat image requirements

## Development Commands

*Note: Commands will be updated once package.json or equivalent is created*

Common commands for this type of project typically include:
- `npm start` or `python main.py` - Run the converter
- `npm test` or `pytest` - Run tests
- `npm run build` - Build distribution version
- `npm run lint` - Code linting

## WeChat-Specific Considerations

- WeChat has strict HTML/CSS limitations
- Images must be optimized for WeChat's constraints
- Styling must use inline CSS or limited internal styles
- Code blocks need special formatting for WeChat compatibility
- Links and references require WeChat-specific handling

## Project Status

This project is in initial setup phase. The PRD document needs to be populated with specific requirements before implementation begins.