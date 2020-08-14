# coursier cache action

A GitHub action to save / restore the coursier cache of your build.

## Adding it

Add a `coursier/cache-action@v1` step to your YAML workflow, like
```yaml
    steps:
      - uses: actions/checkout@v2
      - uses: coursier/cache-action@v1
```

## Parameters

### `root`

*Optional* root directory to look for build sources (`build.sbt`, `build.sc`, etc.)
