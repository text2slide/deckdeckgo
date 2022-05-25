var ToolbarActions;
(function (ToolbarActions) {
  ToolbarActions[ToolbarActions["SELECTION"] = 0] = "SELECTION";
  ToolbarActions[ToolbarActions["LINK"] = 1] = "LINK";
  ToolbarActions[ToolbarActions["IMAGE"] = 2] = "IMAGE";
  ToolbarActions[ToolbarActions["COLOR"] = 3] = "COLOR";
  ToolbarActions[ToolbarActions["ALIGNMENT"] = 4] = "ALIGNMENT";
  ToolbarActions[ToolbarActions["LIST"] = 5] = "LIST";
  ToolbarActions[ToolbarActions["FONT_SIZE"] = 6] = "FONT_SIZE";
  ToolbarActions[ToolbarActions["BACKGROUND_COLOR"] = 7] = "BACKGROUND_COLOR";
})(ToolbarActions || (ToolbarActions = {}));
var ImageSize;
(function (ImageSize) {
  ImageSize["SMALL"] = "25%";
  ImageSize["MEDIUM"] = "50%";
  ImageSize["LARGE"] = "75%";
  ImageSize["ORIGINAL"] = "100%";
})(ImageSize || (ImageSize = {}));
var ImageAlign;
(function (ImageAlign) {
  ImageAlign[ImageAlign["STANDARD"] = 0] = "STANDARD";
  ImageAlign[ImageAlign["START"] = 1] = "START";
})(ImageAlign || (ImageAlign = {}));
var ContentAlign;
(function (ContentAlign) {
  ContentAlign["LEFT"] = "left";
  ContentAlign["CENTER"] = "center";
  ContentAlign["RIGHT"] = "right";
})(ContentAlign || (ContentAlign = {}));
var ContentList;
(function (ContentList) {
  ContentList["ORDERED"] = "insertOrderedList";
  ContentList["UNORDERED"] = "insertUnorderedList";
})(ContentList || (ContentList = {}));
var FontSize;
(function (FontSize) {
  FontSize["X_SMALL"] = "1";
  FontSize["SMALL"] = "2";
  FontSize["MEDIUM"] = "3";
  FontSize["LARGE"] = "4";
  FontSize["X_LARGE"] = "5";
  FontSize["XX_LARGE"] = "6";
  FontSize["XXX_LARGE"] = "7";
})(FontSize || (FontSize = {}));

export { ContentAlign as C, FontSize as F, ImageAlign as I, ToolbarActions as T, ContentList as a, ImageSize as b };
