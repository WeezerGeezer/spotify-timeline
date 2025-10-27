# Testing Guide

Comprehensive testing setup for the Year-End Playlist Analyzer.

## Test Stack

### Backend Tests (Python)
- **pytest** - Test framework
- **pytest-cov** - Coverage reporting
- **pytest-mock** - Mocking support
- **responses** - HTTP request mocking

### Frontend Tests (TypeScript)
- **Vitest** - Fast unit test framework (Vite-native)
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - Custom matchers
- **Playwright** - E2E testing across browsers

## Running Tests

### Backend API Tests
```bash
# Run all backend tests
npm run test:backend
# or
cd backend && pytest

# Run with coverage
cd backend && pytest --cov

# Run specific test file
cd backend && pytest tests/test_spotify_service.py

# Run specific test
cd backend && pytest tests/test_spotify_service.py::TestSpotifyService::test_extract_playlist_id_from_url
```

### Frontend Unit Tests
```bash
# Run all unit tests
npm test

# Watch mode
npm test -- --watch

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

### All Tests
```bash
# Run all test suites
npm run test:all
```

## Test Structure

```
spotify-timeline/
├── backend/
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py              # Pytest fixtures
│       ├── test_spotify_service.py   # Spotify API tests
│       └── test_apple_music_service.py # Apple Music API tests
├── src/
│   ├── __tests__/
│   │   └── setup.ts                  # Test setup
│   └── components/
│       └── __tests__/
│           └── ColorModeSelector.test.tsx # Component tests
└── tests/
    └── e2e/
        └── sankey-visualization.spec.ts # E2E tests
```

## Writing Tests

### Backend API Test Example

```python
import pytest
from services.spotify_service import SpotifyService

def test_extract_playlist_id():
    service = SpotifyService()
    url = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
    assert service.extract_playlist_id(url) == '37i9dQZF1DXcBWIGoYBM5M'
```

### Component Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorModeSelector } from '../ColorModeSelector'

describe('ColorModeSelector', () => {
  it('calls onChange when clicked', () => {
    const mockOnChange = vi.fn()
    render(<ColorModeSelector currentMode="genre" onChange={mockOnChange} />)

    fireEvent.click(screen.getByText('Artist'))
    expect(mockOnChange).toHaveBeenCalledWith('artist')
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should render Sankey diagram', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('svg')).toBeVisible()
})
```

## Test Coverage

Current coverage goals:
- **Backend API**: >80% coverage
- **Frontend Components**: >70% coverage
- **E2E Critical Paths**: 100% coverage

View coverage reports:
- Backend: `backend/htmlcov/index.html`
- Frontend: `coverage/index.html`
- E2E: `playwright-report/index.html`

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

See `.github/workflows/test.yml` for configuration.

## Troubleshooting

### Backend Tests Fail

**Issue**: Import errors or missing dependencies
```bash
# Solution: Install test dependencies
pip install -r requirements.txt
```

**Issue**: Spotify/Apple Music API credentials required
```bash
# Solution: Use mocks or set test credentials
export SPOTIFY_CLIENT_ID=test
export SPOTIFY_CLIENT_SECRET=test
```

### Frontend Tests Fail

**Issue**: Module not found
```bash
# Solution: Install dependencies
npm install
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in vitest.config.ts
test: {
  testTimeout: 10000
}
```

### E2E Tests Fail

**Issue**: Browser not installed
```bash
# Solution: Install browsers
npx playwright install
```

**Issue**: Server not running
```bash
# Solution: Start dev server first or let Playwright start it automatically
# Playwright config includes webServer that auto-starts app
```

## Visual Regression Testing

For Sankey diagram visual testing:

1. **Capture baseline**: First run creates baseline screenshots
2. **Compare**: Subsequent runs compare against baseline
3. **Update**: Use `--update-snapshots` to update baselines

```bash
# Capture/update baselines
npx playwright test --update-snapshots

# Run visual tests
npx playwright test
```

## Best Practices

1. **Test Naming**: Use descriptive test names
   - ✅ `test_extract_playlist_id_from_url_with_query_params`
   - ❌ `test_1`

2. **Arrange-Act-Assert**: Structure tests clearly
```python
def test_feature():
    # Arrange
    service = MyService()

    # Act
    result = service.do_something()

    # Assert
    assert result == expected
```

3. **Mock External APIs**: Don't hit real APIs in tests
```python
@responses.activate
def test_api_call():
    responses.add(responses.GET, 'https://api.example.com', json={})
    # test code
```

4. **Test Edge Cases**: Not just happy paths
   - Empty inputs
   - Invalid data
   - Error conditions
   - Boundary values

5. **Keep Tests Fast**: Unit tests should run in milliseconds

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
