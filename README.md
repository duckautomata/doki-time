# doki-time

A simple site used to help convert Doki Time to GMT and JST, as well as your local time.

## Overview

_Development_

- **[Tech Used](#tech-used)**
- **[Running Locally](#running-locally)**
- **[Testing](#testing)**
- **[Contributing](#contributing)**
- **[Contributing Ideas](#contrubiting-ideas)**
- **[Building a Release](#building-a-new-release)**

## Development

### Tech Used

- Node 26
- Vite to run locally
- React19
- MUI 9

### Running Locally

1. Have Node 24 or later installed
2. Clone the repo locally
3. Run `npm install` to install dependencies
4. Run `npm run dev` and open the site it gives you. Or press `o` and enter to open the site.

Every time you save, Vite will automatically refresh the cache and the site should refresh with the new changes.

#### Update Command

```bash
npx npm-check-updates -u; npm install; npm audit; npm audit fix --min-release-age=0; npm audit signatures --min-release-age=0
```

if any of the install/update commands are failing, you can add `--min-release-age=0` to it to bypass the minimum release age restriction.

### Testing

This project only runs logic tests. The Site is simple enough that it doesn't need anything complicated.

```bash
npm run test
```

### Contributing

1. create a branch and put your code onto it.
2. Run `npm run test`, `npm run format`, `npm run lint` and make sure everything is all good.
3. Push, raise pr, I'll approve.

### Contributing ideas

Raise an issue and detail what idea you have or would like to see.

### Building a new release

New releases are automatically built and deployed when a new pull request is merged into master.
