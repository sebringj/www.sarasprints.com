(function (w, $) { /* programmed by EmeraldCode.com 2011 */
  $.fn.dumbValidation = function () {
        var $form = this, config = (arguments.length > 0) ? arguments[0] : null,
        status = {
            items: {},
            isError: false,
            isProcessError: false,
            isNetworkError: false,
            isDeferred: false,
            isProcessSuccess: false
        },
        fire = function ($this, attribute, ev) {
            if ($this.attr(attribute)) {
                eval($this.attr(attribute)).apply($this[0], [ev]);
            }
            if (config[attribute]) { config[attribute].apply($this, [ev]); }
        },
        elementSelector = 'select, input, textarea',
        setFormStatus = function () {
            var i, isError = false, isDeferred = false, isValidated = true;
            for (i in status.items) {
                isError = isError || status.items[i].isError;
                isDeferred = isDeferred || status.items[i].isDeferred;
                isValidated = isValidated && status.items[i].isValidated;
            }
            status.isDeferred = isDeferred;
            status.isError = isError;
            status.isSuccess = (isValidated && !status.IsDeferred && !status.isError);
        },
        trySubmit = function () {
            setFormStatus();
            if (status.isSuccess) {
                $form.trigger('submit');
            }
        },
        validate = function (ev) {
            var $this = $(this), val = $.trim($this.val()),
            re = null, $match = null, isProcessError = false, isProcessSuccess = false;
            if (!$this.attr('name')) { return; }
            var thisStatus = null;
            if (!status.items[$this.attr('name')]) {
                status.items[$this.attr('name')] = {};
            }
            thisStatus = status.items[$this.attr('name')];
            thisStatus.isValidated = false;
            thisStatus.isError = false;
            thisStatus.isNetworkError = false;
            if (!$this.is(':visible') || $this.isDeferred) { return; }
            if (typeof ($this.attr('required')) === 'undefined' && (val === '')) {
                thisStatus.isValidated = true;
                return;
            }
            if (val === '') {
                thisStatus.isError = true;
            } else if ($this.attr('type') === 'email') {
                re = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$');
                if (!re.test(val)) {
                    thisStatus.isError = true;
                }
            } else if ($this.attr('pattern')) {
                re = new RegExp($this.attr('pattern'));
                if (!re.test(val)) {
                    thisStatus.isError = true;
                }
            } else if ($this.attr('match')) {
                $match = $form.find('[name="' + $this.attr('match') + '"]');
                if ($match.val() !== val) {
                    thisStatus.isError = true;
                }
            }
            if ($this.attr('method')) {
                thisStatus.isError = eval($this.attr('method')).apply($this[0]);
            }
              if (!thisStatus.isError && $this.attr('remoteMethod') && !thisStatus.isDeferred) {
                if (thisStatus.lastGoodValue && thisStatus.lastGoodValue === val) {
                    isProcessSuccess = true;
                } else if (thisStatus.lastBadValue && thisStatus.lastBadValue === val) {
                    isProcessError = true;
                    thisStatus.isError = true;
                } else {
                    thisStatus.isDeferred = true;
                    fire($this, 'processing', ev);
                    eval($this.attr('remoteMethod')).apply($this[0], [{
                        yes: function () {
                            fire($this, 'processSuccess', null);
                            thisStatus.isDeferred = false;
                            thisStatus.isValidated = true;
                            thisStatus.lastGoodValue = val;
                            trySubmit();
                        },
                        no: function () {
                            fire($this, 'processError', null);
                            thisStatus.isDeferred = false;
                            thisStatus.isError = true;
                            thisStatus.isValidated = true;
                            thisStatus.lastBadValue = val;
                        },
                        error: function () {
                            fire($this, 'networkError', null);
                            thisStatus.isDeferred = false;
                            thisStatus.isError = true;
                            thisStatus.isValidated = true;
                        }
                    }]);
                }
            }
            if (!thisStatus.isError && $this.attr('remote')) {
                if (thisStatus.lastGoodValue && thisStatus.lastGoodValue === val) {
                    isProcessSuccess = true;
                } else if (thisStatus.lastBadValue && thisStatus.lastBadValue === val) {
                    isProcessError = true;
                    thisStatus.isError = true;
                } else {
                    thisStatus.isDeferred = true;
                    fire($this, 'processing', ev);
                    $.ajax({
                        url: $this.attr('remote'),
                        data: $this.attr('name') + '=' + escape(val),
                        type: 'POST',
                        dataType: 'json',
                        success: function (d) {
                            if (d.success) {
                                fire($this, 'processSuccess', null);
                                thisStatus.isDeferred = false;
                                thisStatus.isError = false;
                                thisStatus.isValidated = true;
                                thisStatus.lastGoodValue = val;
                            } else {
                                fire($this, 'processError', null);
                                thisStatus.isDeferred = false;
                                thisStatus.isError = true;
                                thisStatus.isValidated = true;
                                thisStatus.lastBadValue = val;
                            }
                        },
                        error: function (a, b, c) {
                            fire($this, 'networkError', null);
                            thisStatus.isDeferred = false;
                            thisStatus.isError = true;
                            thisStatus.isValidated = true;
                        }
                    });
                }
            }
            if (thisStatus.isDeferred) {
                fire($this, 'inputDeferred', ev);
            } else if (thisStatus.isError) {
                thisStatus.isValidated = true;
                if (isProcessError) {
                    fire($this, 'processError', ev);
                } else {
                    fire($this, 'inputError', ev);
                }
            } else {
                thisStatus.isValidated = true;
                if (isProcessSuccess) {
                    fire($this, 'processSuccess', ev);
                } else {
                    fire($this, 'inputSuccess', ev);
                }
            }
        },
        validateForm = function (ev) {
            status.isError = false;
            status.isDeferred = false;
            $form.find(elementSelector).each(function () {
                validate.apply(this);
            });
            setFormStatus();
            if (status.isDeferred) {
                if (config.deferred) { config.deferred.apply($form, [ev]); }
                else { if (ev) { ev.preventDefault(); } }
            } else if (status.isError) {
                if (config.error) { config.error.apply($form, [ev]); }
                else { if (ev) { ev.preventDefault(); } }
            } else {
                if (config.success) { config.success.apply($form, [ev]); }
            }
        };
        $form.off('.dumbValidation').on('submit.dumbValidation', function (ev) {
            validateForm.apply($form, [ev]);
        }).on('focus.dumbValidation', elementSelector, function (ev) {
            if (config.inputFocus) { config.inputFocus.apply(this, [ev]); }
            if ($(this).attr('inputFocus')) { eval($(this).attr('inputFocus')).apply(this, [ev]); }
        }).on('blur.dumbValidation', elementSelector, function (ev) {
            validate.apply(this);
        }).on('change.dumbValidation', elementSelector, function (ev) {
            if (this.tagName === 'SELECT') {
                validate.apply(this, [ev]);
            }
        }).on('keypress.dumbValidation', elementSelector, function (ev) {
            var $this = $(this), $element = $(ev.target);
            if ($element.attr('livevalidate') && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) {
                if ($element.data('dumbValidation-delayed-validate')) {
                    window.clearTimeout($element.data('dumbValidation-delayed-validate'));
                }
                $element.data('dumbValidation-delayed-validate', window.setTimeout(
                    function () {
                        validate.apply(ev.target, [ev]);
                    }, 500
                ));
            }
        });
        $form.find(elementSelector).each(function () {
            var $this = $(this);
            if (!$this.attr('name')) { return; }
            if (!status.items[$this.attr('name')]) { status.items[$this.attr('name')] = { isError: false, isDeferred: false, isValidated: false }; }
        }).end().attr('novalidate', 'novalidate');
        return $form;
    };
})(window, jQuery);