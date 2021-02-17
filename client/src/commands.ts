// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

/** Contains handlers for commands that are enabled in Visual Studio Code for
 * the extension. */

import { EXTENSION_NS } from "./constants";
// NOTE(coc.nvim): Interactive initialization.
// import { pickInitWorkspace } from "./initialize_project";
import { cache as cacheReq } from "./lsp_extensions";
// NOTE(coc.nvim): Some vscode features are missing
import {
  commands,
  ExtensionContext,
  // ProgressLocation,
  Uri,
  // ViewColumn,
  window,
  workspace,
} from "coc.nvim";
import {
  // DocumentUri,
  LanguageClient,
  Location,
  Position,
} from "coc.nvim";
type DocumentUri = unknown;

// deno-lint-ignore no-explicit-any
export type Callback = (...args: any[]) => unknown;
export type Factory = (
  context: ExtensionContext,
  client: LanguageClient,
) => Callback;

/** For the current document active in the editor tell the Deno LSP to cache
 * the file and all of its dependencies in the local cache. */
export function cache(
  _context: ExtensionContext,
  client: LanguageClient,
): Callback {
  return async (uris: DocumentUri[] = []) => {
    // NOTE(coc.nvim): currentState instead of active editor
    // const activeEditor = window.activeTextEditor;
    // if (!activeEditor) {
    //   return;
    // }
    const currentState = await workspace.getCurrentState();
    return window.withProgress({
      // NOTE(coc.nvim): No location
      // location: ProgressLocation.Window,
      title: "caching",
    }, () => {
      return client.sendRequest(
        cacheReq,
        {
          referrer: { uri: currentState.document.uri.toString() },
          textDocument: { uri: currentState.document.uri.toString() },
          uris: uris.map((uri) => ({
            uri,
          })),
        },
      );
    });
  };
}

export function initializeWorkspace(
  _context: ExtensionContext,
  _client: LanguageClient,
): Callback {
  return async () => {
    try {
      // NOTE(coc.nvim): vscode_deno uses interactive picking configuration.
      // Use showPrompt instead.
      // const settings = await pickInitWorkspace();
      const lint = await window.showPrompt("Enable Deno linting?")
      const unstable = await window.showPrompt("Endable Deno unstable APIs?")

      const config = workspace.getConfiguration(EXTENSION_NS);
      await config.update("enable", true);
      // await config.update("lint", settings.lint);
      // await config.update("unstable", settings.unstable);
      await config.update("lint", lint);
      await config.update("unstable", unstable);
      await window.showInformationMessage(
        "Deno is now setup in this workspace.",
      );
    } catch {
      window.showErrorMessage("Deno project initialization failed.");
    }
  };
}

// NOTE(coc.nvim): Help wanted. protocol2CodeConverter not found.
export function showReferences(
  _content: ExtensionContext,
  client: LanguageClient,
): Callback {
  return (uri: string, position: Position, locations: Location[]) => {
    // commands.executeCommand(
    //   "editor.action.showReferences",
    //   Uri.parse(uri),
    //   client.protocol2CodeConverter.asPosition(position),
    //   locations.map(client.protocol2CodeConverter.asLocation),
    // );
  };
}

/** Open and display the "virtual document" which provides the status of the
 * Deno Language Server. */
export function status(
  _context: ExtensionContext,
  _client: LanguageClient,
): Callback {
  return async () => {
    // NOTE(coc.nvim): Use getDocument instead
    // const document = await workspace.openTextDocument(
    //   Uri.parse("deno:/status.md"),
    // );
    const document = workspace.getDocument("deno:/status.md")
    // NOTE(coc.nvim): Use show* instead
    // return window.showTextDocument(document, ViewColumn.Two, true);
    if (!document || !document.content) {
      await window.showErrorMessage("No status found.")
      return;
    }
    await window.showDialog({
      content: document.content
    })
  };
}
