pub mod blocking;
pub mod browser_links;
pub mod cli;
pub mod desktop_files;
pub mod document_io;
pub mod recent_documents;
pub mod recovery;
pub mod vault;

use browser_links::open_browser_link;
use cli::{get_cli_vault_args, is_existing_file, take_pending_files, PendingFiles};
use desktop_files::{
    import_document_asset, import_document_attachment, probe_document, read_document_asset,
    resolve_markdown_link, reveal_document, DocumentProbeCache,
};
use document_io::{canonicalize_document_path, read_document, save_document};
use recent_documents::{
    clear_recent_documents, list_recent_documents, remember_recent_document,
    remove_recent_document, RecentDocumentsStore,
};
use recovery::{
    delete_recovery_document, load_recovery_document, load_recovery_manifest, recovery_directory,
    write_recovery_document, write_recovery_manifest, RecoveryStore,
};
use vault::{
    create_new_file, create_new_folder, delete_file_or_folder, get_default_vault_path,
    get_vault_stats, init_sample_vault, list_vault_tree, open_in_synapse_graph,
    pick_vault_folder, read_asset_file, read_file_content, rename_file_or_folder,
    save_asset_file, search_vault, write_file_content,
};

use tauri::{Emitter, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(PendingFiles::default())
        .manage(DocumentProbeCache::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app: &tauri::AppHandle, args: Vec<String>, _cwd: String| {
            for path in args.iter().skip(1).filter(|a| is_existing_file(a)) {
                app.state::<PendingFiles>()
                    .push_and_notify(path.clone(), || {
                        let _ = app.emit("file-opened", ());
                    });
            }
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            // CLI & File Queuing
            take_pending_files,
            get_cli_vault_args,
            pick_vault_folder,
            open_in_synapse_graph,
            // Native Document IO (from mdedit engine)
            read_document,
            save_document,
            canonicalize_document_path,
            probe_document,
            reveal_document,
            import_document_asset,
            import_document_attachment,
            read_document_asset,
            resolve_markdown_link,
            open_browser_link,
            // Recent Documents
            list_recent_documents,
            remember_recent_document,
            remove_recent_document,
            clear_recent_documents,
            // Session Recovery
            load_recovery_manifest,
            write_recovery_manifest,
            load_recovery_document,
            write_recovery_document,
            delete_recovery_document,
            recovery_directory,
            // Vault File Management
            get_default_vault_path,
            list_vault_tree,
            read_file_content,
            write_file_content,
            create_new_file,
            create_new_folder,
            delete_file_or_folder,
            rename_file_or_folder,
            save_asset_file,
            read_asset_file,
            search_vault,
            get_vault_stats,
            init_sample_vault
        ])
        .setup(|app| {
            let data_root = app.path().app_local_data_dir()?;
            let recovery_root = data_root.join("session-v1");
            app.manage(RecoveryStore::new(recovery_root));
            app.manage(RecentDocumentsStore::new(data_root));

            for path in std::env::args().skip(1).filter(|a| is_existing_file(a)) {
                app.state::<PendingFiles>().push_and_notify(path, || {});
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, _event| {
        #[cfg(target_os = "macos")]
        if let tauri::RunEvent::Opened { urls } = _event {
            for url in urls {
                if let Ok(path) = url.to_file_path() {
                    if path.is_file() {
                        _app_handle.state::<PendingFiles>().push_and_notify(
                            path.to_string_lossy().to_string(),
                            || {
                                let _ = _app_handle.emit("file-opened", ());
                            },
                        );
                    }
                }
            }
        }
    });
}
