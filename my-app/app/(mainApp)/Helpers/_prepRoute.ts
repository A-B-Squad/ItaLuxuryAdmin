function prepRoute(route: string) {
  return route.split(" ").join("-");
}

export default prepRoute;
