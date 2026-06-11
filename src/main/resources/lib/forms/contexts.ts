import { type ContextParams, run } from "/lib/xp/context";
import { type MultiRepoConnection, type MultiRepoConnectParams, multiRepoConnect } from "/lib/xp/node";
import { list as listProjects } from "/lib/xp/project";

export function runAsAdmin<T>(f: () => T, params: Partial<ContextParams> = {}): T {
  return run(
    {
      principals: ["role:system.admin"],
      user: {
        login: "su",
        idProvider: "system",
      },
      ...params,
    },
    f,
  );
}

export function findRepoThatContainsContentWithId(id: string): string | undefined {
  const connection = connectToAllContentRepos();
  const res = runAsAdmin(
    () =>
      connection.query({
        count: 1,
        filters: {
          ids: {
            values: [id],
          },
        },
      }),
    {
      branch: "draft", // If it exists on draft, it exists on master
    },
  );

  return res.hits[0]?.repoId;
}

type MultiRepoConnectParamsSource = MultiRepoConnectParams["sources"][number];

function connectToAllContentRepos(): MultiRepoConnection {
  const projects = runAsAdmin(() => listProjects());

  const sources = projects.map<MultiRepoConnectParamsSource>((project) => ({
    repoId: `com.enonic.cms.${project.id}`,
    branch: "master",
    principals: ["role:system.admin"],
  }));

  return multiRepoConnect({
    sources,
  });
}
