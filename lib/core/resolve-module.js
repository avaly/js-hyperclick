"use babel"
// @flow
import path from "path"
import { sync as resolve } from "resolve"
import { getProjectProps } from "./project-manager"
import type { Resolved } from "../types"

// Default comes from Node's `require.extensions`
const defaultExtensions = [".js", ".json", ".node"]
type ResolveOptions = {
  extensions?: typeof defaultExtensions,
}

function loadModuleRoots() {
  const project = getProjectProps()
  if (!project) {
    return null
  }

  let roots = project.moduleRoots
  if (roots) {
    if (typeof roots === "string") {
      roots = [roots]
    }

    const projectDir = project.paths[0]
    roots = roots.map(r => path.resolve(projectDir, r))
  }

  return roots
}

function resolveWithCustomRoots(basedir, absoluteModule, options) {
  const { extensions = defaultExtensions } = options
  const moduleName = `./${absoluteModule}`

  const roots = loadModuleRoots()

  if (roots) {
    const resolveOptions = { basedir, extensions }
    for (let i = 0; i < roots.length; i++) {
      resolveOptions.basedir = roots[i]

      try {
        return resolve(moduleName, resolveOptions)
      } catch (e) {
        /* do nothing */
      }
    }
  }
}

export default function resolveModule(
  filePath: string,
  suggestion: { moduleName: string },
  options: ResolveOptions = {},
): Resolved {
  const { extensions = defaultExtensions } = options
  let { moduleName } = suggestion

  const basedir = path.dirname(filePath)
  const resolveOptions = { basedir, extensions }

  let filename

  try {
    filename = resolve(moduleName, resolveOptions)
    if (filename == moduleName) {
      return {
        type: "url",
        url: `http://nodejs.org/api/${moduleName}.html`,
      }
    }
  } catch (e) {
    /* do nothing */
  }

  // Allow linking to relative files that don't exist yet.
  if (!filename && moduleName[0] === ".") {
    if (path.extname(moduleName) == "") {
      moduleName += ".js"
    }

    filename = path.join(basedir, moduleName)
  } else if (!filename) {
    filename = resolveWithCustomRoots(basedir, moduleName, options)
  }

  return { type: "file", filename }
}
