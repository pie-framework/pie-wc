import semver from 'semver';

export enum ReleaseType {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
  PREMAJOR = 'premajor',
  PREMINOR = 'preminor',
  PREPATCH = 'prepatch',
  PRERELEASE = 'prerelease',
  RELEASE = 'release',
}

export interface SemVerPrerelease {
  tag: string;
  version: number;
}

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease: SemVerPrerelease;
}

export interface VersionedID {
  id: string;
  semver: SemVer;
}

export class SemVerError extends Error {
  constructor(message) {
    super(message);
  }
}

export abstract class SemVerHelper {

  static encode(semVer: SemVer): string {
    if (!semVer) {
      return;
    }
    const base = [semVer.major, semVer.minor, semVer.patch].join('.');
    if (this.isPrerelease(semVer)) {
      const prerelease = [semVer.prerelease.tag, semVer.prerelease.version].join('.');
      return [base, prerelease].join('-');
    }
    return base;
  }

  static decode(raw: string): SemVer {
    let semV: semver.SemVer;
    if (raw && (semV = semver.parse(raw))) {
      let prerelease: SemVerPrerelease = { tag: null, version: null };
      if (semV.prerelease.length === 2) {
        prerelease = {
          tag: String(semV.prerelease[0]),
          version: parseInt(String(semV.prerelease[1]), 10),
        };
      }
      return {
        prerelease,
        major: semV.major,
        minor: semV.minor,
        patch: semV.patch,
      };
    }
    throw new SemVerError(`Could not decode version: ${raw}`);
  }

  static isPrerelease(version: SemVer): boolean {
    return !isNil(version?.prerelease?.tag) && !isNil(version?.prerelease?.version);
  }

  static compareVersions(v1: SemVer, v2: SemVer) {
    if (!v1) return -1;
    if (!v2) return 1;
    return semver.compare(SemVerHelper.encode(v1), SemVerHelper.encode(v2));
  }

  static isReleaseRequest(releaseType: ReleaseType): boolean {
    return [ReleaseType.MAJOR, ReleaseType.MINOR, ReleaseType.PATCH].includes(releaseType);
  }
}

export abstract class VersionedIDHelper {
  /**
   * Extract versioned ID strings into separate components.
   */
  static fromString = (value: string): VersionedID => {
    if (!value) {
      return { id: null, semver: null };
    }
    if (typeof value !== 'string') {
      return value;
    }
    let id: string;
    let version: string;
    const components = value.split('@');
    if (components.length === 1) {
      [id, version] = [components[0], 'latest'];
    } else if (components.length === 2) {
      [id, version] = components;
    } else {
      throw new TypeError(`Not valid SemVer string: ${value}`);
    }
    if (version === 'latest') {
      return { id, semver: null }; // resolve "latest" version;
    }
    try {
      const semver = SemVerHelper.decode(version);
      return { id, semver };
    } catch (e) {
      throw new TypeError(`Not valid SemVer string: ${value}`);
    }
  };

  /**
   * Encodes `VersionedID` components into a string.
   * @param version
   */
  static toString = (version: VersionedID): string => {
    const encoded = SemVerHelper.encode(version.semver);
    if (!encoded) {
      return version.id;
    }
    return [version.id, encoded].join('@');
  };
}

/**
 * Create a new version.
 */
export const mkVersion = (major: number, minor: number, patch: number, prerelease?: number): SemVer => {
  const version: SemVer = {
    major,
    minor,
    patch,
    prerelease: { tag: null, version: null },
  };

  if (prerelease != null && prerelease >= 0) {
    version.prerelease = { tag: 'draft', version: prerelease };
  }

  return version;
};

/**
 * Force a change in the model so the signature check passes.
 */
export const mkChange = (model: any) => {
  return { ...model, lastUpdatedAt: new Date() };
};

const isNil = (value: any): boolean => {
  return value === null || value === undefined;
};
