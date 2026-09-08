# Changesets

Add a Changeset to each pull request that changes the published package. Choose the
smallest appropriate SemVer bump and describe the consumer-visible change. Do not
manually edit `CHANGELOG.md`.

The release workflow combines pending Changesets into a version pull request. The
version command consumes these files, generates `CHANGELOG.md`, and updates the
package version. Merging that pull request publishes the package.
