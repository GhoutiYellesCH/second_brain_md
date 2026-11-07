fn main() {
    println!("cargo:rustc-link-search=native=/home/gotoro/workspace/second_brain_md/src-tauri/native-libs");
    tauri_build::build()
}
