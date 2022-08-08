export async function loadModel(url, material){

    let result = await BABYLON.SceneLoader.ImportMeshAsync("", "", url, scene);
    result.meshes.forEach(mesh=>{
        mesh.name = "editUV";
        mesh.id = "editUV";
        mesh.material = material;
        mesh.renderingGroupId = 2;
        mesh.normalizeToUnitCube();
    })
    let rootmesh = result.meshes[0];
    return rootmesh;
}