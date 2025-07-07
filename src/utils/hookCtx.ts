// This is a helper file for managing hooks.

export const createHook = () => {
  const hooks = [];

  const on = (Hook: Function) => {
    hooks.push(Hook);
  };

  const run = () => {
    hooks.forEach((hookFunc) => {
      try {
        hookFunc();
      } catch (error) {
        console.error("Error running hook:", error);
      }
    });
  }

    const destroy = () => {
        hooks.length = 0; // Clear the hooks array
    };

  return { on, run, destroy };
}