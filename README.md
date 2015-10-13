# browser-downloader

Utility to download the latest browser builds

Downloads the latest and nightly version of browser builds.
Intended for use with cron scripts and other tasks to automate deployment.

## Usage

```
$ browser-downloader targetDir
```


## Prerequisites

The Edge VM installation requires the following:

- `z7a` on `PATH`
  `brew install p7zip`
- `vmrun` on `PATH`
  `export PATH="$PATH:/Applications/VMware Fusion.app/Contents/Library/"`
- [VMWare OVF Tools](https://www.vmware.com/support/developer/ovf/)
