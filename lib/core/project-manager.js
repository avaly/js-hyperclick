"use babel"
// @flow

import type { Project } from "../types"

let currentProject

export function updateProject(project: Project) {
  currentProject = project
}

export function getProjectProps() {
  if (!currentProject || !currentProject.props) {
    return null
  }

  return currentProject.props
}
