# Contributing to REAN

Thank you for helping build REAN, a free, community-driven educational platform for
Cambodia. Contributions of code, documentation, translations, and ideas are all welcome.

## License of contributions

REAN's application code is licensed under the **Apache License 2.0 (Apache-2.0)**.
Documentation and written content are licensed under
**Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)**.

By contributing, you agree that your contribution is provided under these same licenses.
Under Apache-2.0, this includes granting a patent license for your contribution, as
described in section 3 of the license.

## Developer Certificate of Origin (DCO)

We use the [Developer Certificate of Origin](https://developercertificate.org/) instead
of a Contributor License Agreement. It is a simple statement that you have the right to
submit the code you are contributing.

Every commit must be signed off. Add a `Signed-off-by` line to your commit message by
committing with the `-s` flag:

```bash
git commit -s -m "Your commit message"
```

This appends a line like:

```
Signed-off-by: Your Name <your.email@example.com>
```

By signing off, you certify the statement in the full DCO text below.

<details>
<summary>Developer Certificate of Origin 1.1 (full text)</summary>

```
By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I have the right to
    submit it under the open source license indicated in the file; or

(b) The contribution is based upon previous work that, to the best of my knowledge, is
    covered under an appropriate open source license and I have the right under that
    license to submit that work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am permitted to submit under a
    different license), as indicated in the file; or

(c) The contribution was provided directly to me by some other person who certified
    (a), (b) or (c) and I have not modified it.

(d) I understand and agree that this project and the contribution are public and that a
    record of the contribution (including all personal information I submit with it,
    including my sign-off) is maintained indefinitely and may be redistributed
    consistent with this project or the open source license(s) involved.
```

</details>

## How to contribute

1. Fork the repository and create a branch for your change.
2. Make your change. Keep the code style consistent with the surrounding code.
3. Run the checks locally before opening a pull request:
   ```bash
   npm install
   npm run format   # Prettier
   npm run lint     # TypeScript type checking
   npm run test     # Vitest
   ```
4. Commit with a clear message and the DCO sign-off (`git commit -s`).
5. Open a pull request describing what you changed and why.

## Reporting issues

Please open a GitHub issue for bugs, feature requests, or documentation problems.
Include steps to reproduce for bugs.

## Trademark

The REAN name and logo are project trademarks. Please review [TRADEMARK.md](./TRADEMARK.md)
before using them in a fork or derivative.
